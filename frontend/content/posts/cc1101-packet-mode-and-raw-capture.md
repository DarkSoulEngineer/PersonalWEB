---
title: CC1101 PHY notes: packet mode is not raw capture
author: Milchiș Cătălin-Marian
date: 2026-11-12
tags: CC1101, RF, Embedded, Research
---
The CC1101 can deliver framed packets or a digital demodulator output. Those paths answer different questions. Here is how I separate them in my ESP32-S3 driver, and what each can actually tell us.

This is a source-level research note on [CC1101_DRIVER at commit 0656de5](https://github.com/DarkSoulEngineer/CC1101_DRIVER/tree/0656de50adbf87d35de05eed8db9b64a78473e82), not a new RF measurement report. The calculations below can be reproduced without a radio. The coordinated modulation profiles and RMT capture backend at this revision still need hardware validation.

## The setup

RFuzz uses an ESP32-S3 and two CC1101 modules on a shared SPI bus, with separate chip-select and GDO0 connections. Radio A is configured but remains idle. Radio B listens. There is no automatic transmission or payload comparison in this revision.

The starting profile is OOK at a requested 433.92 MHz, approximately 38.4 kbps, with a 26 MHz crystal. Packet mode uses variable-length framing, CRC and 30-of-32-bit sync detection. Selecting raw reception changes the receive format on B; it does not turn the board into an SDR.

That distinction matters when investigating an unfamiliar signal. A silent packet receiver might be rejecting the framing rather than failing to detect RF activity.

## Start with the register values

The [driver implementation](https://github.com/DarkSoulEngineer/CC1101_DRIVER/blob/0656de50adbf87d35de05eed8db9b64a78473e82/components/cc1101/src/cc1101.c) applies `MDMCFG4 = 0xCA` and `MDMCFG3 = 0x83` in the coordinated profiles. `MDMCFG4` contains both the data-rate exponent and the receive-bandwidth fields. Treating it as one independent “speed” register would overwrite part of the receiver configuration.

For the 26 MHz crystal, the CC1101 datasheet gives:

```text
data rate = (256 + DRATE_M) × 2^DRATE_E × f_xosc / 2^28
RX bandwidth = f_xosc / (8 × (4 + CHANBW_M) × 2^CHANBW_E)
carrier at channel 0 = FREQ × f_xosc / 2^16
```

Decode `0xCA`: `CHANBW_E = 3`, `CHANBW_M = 0`, and `DRATE_E = 10`. The mantissa in `0x83` is 131. These produce about 38,383.484 bit/s and 101,562.5 Hz receive bandwidth. “38.4 kbps” is a useful label, not the exact programmed value.

This Python 3 calculation uses only the standard library. It does not connect to hardware:

```python
f_xosc = 26_000_000
requested_hz = 433_920_000
mdmcfg4, mdmcfg3 = 0xCA, 0x83

rate_e = mdmcfg4 & 0x0F
bw_m = (mdmcfg4 >> 4) & 0x03
bw_e = (mdmcfg4 >> 6) & 0x03
rate = (256 + mdmcfg3) * 2**rate_e * f_xosc / 2**28
bandwidth = f_xosc / (8 * (4 + bw_m) * 2**bw_e)
frequency_word = int(requested_hz * 2**16 / f_xosc)
carrier = frequency_word * f_xosc / 2**16

print(f"FREQ word: 0x{frequency_word:06X}")
print(f"Carrier: {carrier:.3f} Hz")
print(f"Data rate: {rate:.3f} bit/s")
print(f"RX bandwidth: {bandwidth:.1f} Hz")

assert frequency_word == 0x10B071
assert abs(rate - 38_383.484) < 0.001
assert bandwidth == 101_562.5
```

These are nominal values derived from registers. They do not include crystal tolerance, frequency drift or measurement error. Register readback can establish what was programmed; it cannot establish the actual carrier frequency or occupied bandwidth.

## What packet mode filters out

Packet reception depends on more than carrier frequency. Modulation, rate, sync detection, length handling and CRC configuration all affect what reaches the application.

For the OOK profile, the relevant mode changes are:

| Register | Packet RX | Raw RX | Meaning |
| :--- | :--- | :--- | :--- |
| `PKTCTRL0` | `0x05` | `0x30` | Variable-length packets with CRC versus asynchronous serial format |
| `MDMCFG2` | `0x33` | `0x30` | ASK/OOK with 30/32 sync detection versus no sync detection |
| `IOCFG0` | `0x06` | `0x0D` | Sync/packet indication versus asynchronous serial data |

These values describe OOK. The FSK profiles use different modulation bits in `MDMCFG2`; the table is not a universal register recipe.

A frame with a failed CRC is also different from no frame. The driver exposes `cc1101_poll_packet()` so the application can distinguish consuming a frame from that frame passing its hardware CRC check. Collapsing those into one Boolean would hide useful evidence during receiver work.

CRC validity is not sender authentication. It says nothing by itself about who sent the payload, whether the command is authorized, or whether the same frame has been replayed.

## What “raw” means here

Raw reception routes the selected demodulator's digital output to GDO0. The ESP32-S3 RMT peripheral records levels and durations. It does not record complex I/Q samples, RF amplitude or phase. The radio has already filtered and demodulated the incoming signal.

That puts limits on later analysis. A pulse trace may help investigate timing and encoding, but it cannot recover information the demodulator did not preserve. Choosing the wrong modulation or receive bandwidth still matters in raw mode.

The [capture implementation](https://github.com/DarkSoulEngineer/CC1101_DRIVER/blob/0656de50adbf87d35de05eed8db9b64a78473e82/components/hw_init/src/hw_capture.c) uses 1 µs resolution, a 1 µs glitch filter and 5 ms idle termination. Capture is bounded, with partial blocks and finite delivery slots. A block ending is not proof that a radio packet ended. A callback timestamp is notification time, not the timestamp of the first captured edge.

Serial output is bounded too. Suppressing a preview to stay within UART bandwidth is not the same as losing captured symbols. Conversely, printing no drop warning does not establish that the complete waveform was captured. Known drops, rearm gaps and unmeasured hardware loss need separate treatment.

## Switching modes without mixing evidence

The [profile coordinator](https://github.com/DarkSoulEngineer/CC1101_DRIVER/blob/0656de50adbf87d35de05eed8db9b64a78473e82/components/rfuzz/components/profile/src/profile.c) keeps requested and applied state separate. It stops capture, takes the shared bus lock, applies the profile, starts reception and reads back radio state. Only a successful transition marks the profile valid.

On failure, it stops capture and requests IDLE on both radios on a best-effort basis. A bus-lock timeout can defer cleanup. This is not an atomic transaction with guaranteed rollback.

For a receive-only investigation on your own authorized bench, the documented console sequence is:

```text
mod ook
```

Wait for a successful profile transition before requesting raw mode:

```text
mode raw
status
```

To return to framed reception:

```text
mode pck
status
```

These are commands documented by the pinned source, not a transcript of a run performed for this article. If the profile is invalid, recover explicitly with `mod ...`; a mode-only request does not repair it.

Record the firmware commit, module identity, requested profile, actual readback, transition outcome and capture counters with each trace. Otherwise, a change in output can be mistaken for a change in the signal when the receiver itself changed state.

## What is established, and what is still open

The source and register arithmetic establish the intended configuration and the distinction between the two receive paths.

The repository documents earlier hardware runs with CRC-valid packets and packet/raw restoration. Those runs used earlier firmware. They do not validate the later coordinated profiles, lean listen-only application or replacement RMT backend.

The next hardware work should measure pulse timing against a known reference, exercise capture backpressure, and verify packet/raw restoration for each candidate profile. That work should retain raw logs and account for gaps rather than reporting only successful decodes.

Transmit power is a separate measurement problem. A `PATABLE` value is not a measured conducted power, and neither is it evidence of radiated-power compliance. Any future transmit experiment needs an authorized setup and a check of the applicable frequency, power and duty-cycle rules.

The practical conclusion is narrow: packet mode is useful for traffic that matches the configured packet engine. Digital raw capture exposes a different part of the receive path, but it is neither an arbitrary-protocol decoder nor a lossless RF recording.

## Sources

1. [CC1101_DRIVER README and validation history, pinned revision](https://github.com/DarkSoulEngineer/CC1101_DRIVER/blob/0656de50adbf87d35de05eed8db9b64a78473e82/README.md).
2. [CC1101 driver, register configuration and profile readback](https://github.com/DarkSoulEngineer/CC1101_DRIVER/blob/0656de50adbf87d35de05eed8db9b64a78473e82/components/cc1101/src/cc1101.c).
3. [ESP32-S3 capture backend](https://github.com/DarkSoulEngineer/CC1101_DRIVER/blob/0656de50adbf87d35de05eed8db9b64a78473e82/components/hw_init/src/hw_capture.c).
4. [Texas Instruments CC1101 datasheet](https://www.ti.com/lit/ds/symlink/cc1101.pdf), modem configuration, packet handling and GDO signal descriptions.

The [project case study](/projects/cc1101-driver) covers the broader driver architecture.
