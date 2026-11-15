---
title: Sub-GHz radio for beginners: what a CC1101 module does
author: Milchiș Cătălin-Marian
date: 2026-11-14
tags: Beginner, Radio, CC1101, Embedded
---
A 433 MHz remote is not Wi-Fi and not Bluetooth. It is a small radio link below 1 GHz, usually built from a cheap transceiver, a microcontroller and a short antenna. The CC1101 is one of the common parts behind that kind of link.

This article explains what the chip does, which settings have to match at both ends, and why a receiver can see radio energy yet still produce no packets.

## Why below 1 GHz

Lower frequencies generally travel farther and pass through walls better than 2.4 GHz links at the same transmit power. That makes sub-GHz radio attractive for remotes, door and window sensors, utility meters, tire-pressure sensors and industrial telemetry.

The trade-offs are real. Antennas are physically larger, data rates are lower, and the popular bands are crowded. A 433 MHz quarter-wave antenna is about 16 cm, which is acceptable in a handheld remote but awkward inside a thin phone.

Common bands include 315 MHz, 433 MHz, 868 MHz and 915 MHz. The exact band, power limit and duty cycle depend on your region. In Europe, many short-range devices in these bands fall under the ETSI EN 300 220 family of standards. Check your national regulator before transmitting.

## Licence-exempt is not unregulated

The industrial, scientific and medical bands are often described as free to use. They are not free of rules. Transmit power, occupied bandwidth, duty cycle and channel spacing are limited so that many devices can share the band.

Those limits are also why sub-GHz links are usually low duty cycle: a sensor wakes up, sends a short frame and sleeps. Continuous transmission is rarely appropriate.

## What the CC1101 actually is

The CC1101 is a transceiver, not a microcontroller. It contains a transmitter, a receiver, a modem, a packet engine, a small FIFO and an SPI interface. It handles the radio work. Your microcontroller handles the application.

A typical node is a microcontroller connected over SPI to the CC1101, a 26 MHz crystal for the reference clock, a matching network, and an antenna. The datasheet lists bands around 300 to 348 MHz, 387 to 464 MHz and 779 to 928 MHz, depending on the variant and configuration.

The chip does not decide what your payload means. It moves bytes or bits. The meaning comes from your protocol.

## The settings that must match

Two radios only communicate if their configurations agree. Matching only the frequency is the classic beginner mistake. The receiver may show energy on a spectrum display while the packet engine rejects every frame.

The important settings are:

| Setting | What it controls |
| :--- | :--- |
| Frequency | The centre of the channel |
| Modulation | OOK/ASK, FSK or GFSK |
| Data rate | How fast symbols are sent |
| Receive bandwidth | The filter width around the channel |
| Sync word | The bit pattern that marks the start of a frame |
| Packet length and CRC | How the receiver frames and checks a packet |
| Whitening and Manchester encoding | Optional line coding that both ends must share |

A receiver bandwidth that is too narrow cuts the signal. One that is too wide admits more noise. The data rate and bandwidth are related: a fast signal needs a wider filter, and a narrow filter needs a slower signal.

## OOK and FSK

On-off keying switches the carrier on and off. It is simple, cheap and common in remotes and sensors. Many of those devices use a pulse-distance encoding on top of OOK, where the length of the gap between pulses represents a zero or a one.

FSK shifts the carrier between two frequencies. It is generally more resistant to amplitude noise and is common in digital links that need a more reliable connection.

Neither modulation is encryption. A receiver that knows the frequency and encoding can recover the bits.

## Packet mode and raw mode

The CC1101 can hand you two different things. In packet mode, the chip looks for a sync word, checks the length and optionally verifies a CRC before the microcontroller reads a frame. In raw mode, the demodulator output is routed to a pin, and the microcontroller captures the resulting pulses.

Packet mode is convenient when the traffic matches your configuration. Raw mode is useful when you want to see the timing and encoding of an unfamiliar signal. Raw mode is not a lossless recording of the radio spectrum: the chip has already filtered and demodulated the signal.

The [CC1101 project page](/projects/cc1101-driver) shows what the module is used for and how the ESP32-S3 driver fits in.

## Security relevance

Many inexpensive remotes and sensors send the same code every time a button is pressed. If you record that code, replaying it may produce the same action. Better designs use rolling codes or a challenge-response exchange, but those are application-layer choices, not properties of the radio.

A CRC is not authentication. It detects accidental corruption. It does not prove who sent a frame, and it does not stop a replay.

Test only devices you own or have written permission to assess. Transmitting on a band without authorization can interfere with other users and may be illegal. For bench work, use a shielded setup or an attenuator rather than radiating across the room.

## A safe first bench

Two CC1101 modules, two microcontrollers, a stable 3.3 V supply and a logic analyzer are enough to learn the basics. Configure both ends with the same frequency, modulation, rate, sync word and CRC settings. Send a short packet and confirm that the receiver reports a valid CRC.

Then change one setting at a time and observe what fails. That exercise teaches more than reading the datasheet alone, and it makes the difference between packet mode and raw mode concrete.

If industrial networks are more relevant to your work, continue with [Modbus for beginners](/posts/modbus-basics-local-lab).

## Sources

1. [Texas Instruments CC1101 datasheet](https://www.ti.com/lit/ds/symlink/cc1101.pdf), for frequency bands, modulation, packet handling and register descriptions.
2. [CC1101_DRIVER at the pinned revision](https://github.com/DarkSoulEngineer/CC1101_DRIVER/tree/0656de50adbf87d35de05eed8db9b64a78473e82), for the receive paths and profile configuration described here.
