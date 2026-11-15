---
title: What is software-defined radio?
author: Milchiș Cătălin-Marian
date: 2026-11-15
tags: Beginner, SDR, Radio, Fundamentals
---
A software-defined radio moves part of the signal chain into software. Instead of building a separate demodulator for every mode, the receiver digitizes a wide slice of spectrum and lets your computer decode it.

That is the whole idea. The details are mostly about what the hardware still has to do, and what the samples can and cannot tell you.

## A radio is a chain

A conventional receiver starts at the antenna and works through a filter, a low-noise amplifier, a mixer that shifts the signal down in frequency, and a demodulator that recovers audio or bits. Each stage is built for a particular band and modulation.

An SDR cuts that chain earlier. A tuner selects a band, an analog-to-digital converter samples it, and software performs the rest: filtering, tuning within the captured band, demodulation and decoding.

This is why one dongle can receive broadcast FM, aircraft voice, pagers, weather satellites and sensor telemetry. The hardware is general purpose. The mode lives in software.

## The antenna still matters

An SDR does not remove the physics. A receiver is only as good as the signal reaching its input. A random piece of wire will pick up strong local FM stations and little else.

Put the antenna where it can hear the band you care about. Keep it away from switching power supplies, monitors and USB 3 ports, which can raise the noise floor. A cheap filter in front of a crowded band often helps more than a more expensive dongle.

## What a receive dongle contains

An RTL-SDR is a USB receiver built around the RTL2832U chipset and a tuner such as the R820T2. It covers roughly 24 MHz to 1.7 GHz depending on the tuner and model, uses an 8-bit ADC, and cannot transmit.

Those numbers are a useful reality check. Eight bits is not a lot of dynamic range. A strong transmitter nearby can push the converter into clipping, and no amount of software gain will restore the missing information.

Not every SDR is receive-only. Some devices transmit as well. Before connecting an antenna and pressing transmit, check what the hardware supports and what your licence or local rules allow.

## I and Q, without the math

At each sample instant, an SDR records two values, called I and Q. A simple mental model is a point on a two-dimensional plane. The distance from the centre is amplitude. The angle is phase.

That representation keeps enough information to recover both amplitude modulation and frequency or phase modulation. Broadcast AM changes the amplitude. FM changes the frequency, which shows up as a changing phase. A digital mode may use both.

The sample rate sets how much spectrum you capture at once. At 2.4 million samples per second you see roughly 2.4 MHz of bandwidth, which is wider than most narrowband signals. The RTL-SDR can be pushed to 3.2 MS/s, but its documentation notes that the stable rate is around 2.56 MS/s and that higher rates can drop samples. Dropped samples matter when decoding, less so when you are only looking at a spectrum display.

## What to listen to first

Start with signals you can identify by ear. Broadcast FM is easy and gives you an immediate reference for tuning, gain and antenna placement.

From there, try aircraft voice in the civil airband between 108 and 137 MHz, APRS around 144.8 MHz, or weather satellite images around 137 MHz while those transmissions are active. Around 433 MHz you will find remotes, sensors and other short-range devices.

Receiving is regulated differently from transmitting, and some services are encrypted or legally protected even where reception is technically possible. Check the rules where you live, and do not decode private communications.

## Gain, overload and noise

Most beginner problems are gain problems. Too little gain and weak signals disappear into the noise. Too much gain and strong signals create spurious products across the band. When the spectrum looks full of signals that vanish when you reduce gain, the receiver is probably overloaded.

Use the lowest gain that still shows the signal you want. If a strong FM transmitter is close, a band-stop filter can help more than any software setting.

## Where fixed-function radios differ

A CC1101 is not an SDR in this sense. It contains a hardware demodulator, a packet engine and a small FIFO. You configure it over SPI and read framed packets or the digital output of the demodulator. That is cheaper, lower power and a better fit for a battery-powered sensor, but you cannot replace the demodulation algorithm after the fact.

This distinction matters when reading capture data. The CC1101 raw mode in my driver produces a digitized demodulator output, not I/Q samples. It can tell you about pulse timing. It cannot recover phase information the demodulator discarded. I cover that in the [CC1101 packet-mode article](/posts/cc1101-packet-mode-and-raw-capture).

## A first setup

A practical starting point is an RTL-SDR dongle, an antenna cut for the band you want to explore, and free software such as SDR++, GQRX or SDR#. Tune to a known signal, adjust gain, and compare what you see with what you hear.

Then record a short I/Q capture and replay it. Working from a recording makes it much easier to learn because the signal no longer changes while you experiment.

The useful mental model is simple: the dongle turns radio into numbers, and software turns numbers into meaning. Everything else is learning what the numbers contain.

If you want to see the fixed-function side of radio, continue with [sub-GHz radio and the CC1101](/posts/sub-ghz-radio-cc1101-basics).

## Sources

1. [RTL-SDR: about the dongle and software-defined radio](https://www.rtl-sdr.com/about-rtl-sdr/), including the receive-only limitation, tuner ranges, sample rates and ADC resolution.
2. [Texas Instruments CC1101 datasheet](https://www.ti.com/lit/ds/symlink/cc1101.pdf), for the fixed-function transceiver comparison.
