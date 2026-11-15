---
title: Modbus for beginners: read your first registers in a local lab
author: Milchiș Cătălin-Marian
date: 2026-11-13
tags: Beginner, Modbus, Industrial, Lab
---
Modbus is one of the oldest and most common ways for industrial devices to exchange data. It is also simple enough to learn on one machine, without touching a real controller.

This article covers the data model, the parts that trip up beginners, and a local simulator lab you can run with my command-line client.

## A short protocol with a long life

Modicon introduced Modbus in 1979. It survived because it is small and easy to implement. A client sends a request, a server sends a response, and both sides agree on a compact set of function codes.

You will see two sets of names. Client and server describe the roles in the request-response exchange. Master and slave are the older serial terms and still appear in device manuals and tooling. In this article, client and server mean the same thing as master and slave.

Modbus is an application-layer protocol. It can run over serial lines as Modbus RTU or Modbus ASCII, or over TCP/IP as Modbus TCP. The function codes and data model stay the same; the framing changes.

## The four data tables

Modbus exposes simple values through four tables. Two are one bit wide, two are 16 bits wide. Two are read-only, two are read-write.

| Table | Width | Access | Conventional address range |
| :--- | :--- | :--- | :--- |
| Coils | 1 bit | Read and write | 00001 to 09999 |
| Discrete inputs | 1 bit | Read-only | 10001 to 19999 |
| Input registers | 16 bit | Read-only | 30001 to 39999 |
| Holding registers | 16 bit | Read and write | 40001 to 49999 |

Those ranges are documentation conventions, not bytes on the wire. The protocol itself uses zero-based offsets. A device manual that says holding register 40001 usually means offset 0. A tool that accepts standard notation should convert it for you, but the mapping is worth checking when a read returns the wrong value.

## The function codes you will use first

| Code | Operation |
| :--- | :--- |
| 01 | Read coils |
| 02 | Read discrete inputs |
| 03 | Read holding registers |
| 04 | Read input registers |
| 05 | Write a single coil |
| 06 | Write a single register |
| 15 | Write multiple coils |
| 16 | Write multiple registers |

The protocol sets limits on how much can be read or written in one request. A common limit is 125 registers for a read and 123 registers for a multiple write. Good clients enforce those limits and split large operations.

If a request is invalid, the server returns an exception response: the function code with the high bit set, followed by an exception code such as illegal data address or illegal data value. That response is useful. It usually means the address or count is wrong, not that the network is broken.

## A register is just a number

Modbus does not define units, scaling or data types beyond 16-bit words. A holding register containing `235` might mean 23.5 degrees, 235 volts, or a device state. The manual for the device defines the meaning.

Wider values span multiple registers. A 32-bit float uses two 16-bit registers, and the order of those registers matters. Byte order and word order are separate settings. If a value looks like nonsense, check both before assuming the sensor is broken.

This is the part beginners underestimate. Reading a register is easy. Knowing what the number represents is the actual work.

## Security, briefly

Classic Modbus has no authentication, authorization or encryption. Anyone who can reach the server can often read and write the exposed tables. Modbus RTU adds a CRC to each frame, but that detects accidental corruption, not tampering or impersonation. Modbus TCP relies on the transport and has no equivalent frame check.

The Modbus Organization publishes a separate Modbus/TCP Security specification that uses TLS on port 802. It is a different profile from plain Modbus/TCP on port 502, and both ends must support it.

Exposed Modbus servers are common on the public internet. Those are other people's devices. Do not scan or write to them. Use a local simulator, your own equipment, or a lab you have permission to use.

## A local simulator lab

My [modbus client](https://github.com/DarkSoulEngineer/modbus/tree/2db3e66f30ab94ba396d30744bae6e0c43e1a212) includes an embedded Modbus TCP server with drifting sensor values. The [Modbus project page](/projects/modbus) covers the client itself: transports, command set and the safety notes around write operations. The commands below come from the project README at the pinned revision. They are documented examples, not a transcript of a run for this article.

Install it with Python 3.10 or newer:

```bash
pip install git+https://github.com/DarkSoulEngineer/modbus.git
```

Start the simulator in one terminal:

```bash
modbus simulate
```

By default it binds to `127.0.0.1` on port `5021` and starts three slave units beginning at unit ID 1. Leave it running and open a second terminal.

Read six holding registers from the first unit:

```bash
modbus read 127.0.0.1 -p 5021 -a 40001 -c 6 --slave 1
```

The `-a 40001` uses standard notation, so the first value shown corresponds to offset 0. `-c 6` asks for six registers. The simulator fills its tables with realistic values such as temperature, pressure, flow and RPM, and those values drift over time.

Watch the same range and let the client show changes:

```bash
modbus watch 127.0.0.1 -p 5021 -a 40001 -c 6 --interval 1 --slave 1
```

Write two registers, then read them back:

```bash
modbus write 127.0.0.1 -p 5021 -a 40101 123 456
modbus read 127.0.0.1 -p 5021 -a 40101 -c 2 --slave 1
```

Ask for JSON when you want to inspect the raw response in a script:

```bash
modbus read 127.0.0.1 -p 5021 -a 40001 -c 10 --json
```

The simulator is a safe place to make mistakes. A write to a real holding register can change a physical setpoint, so keep the distinction clear.

## What to try next

Change the unit ID and see how the responses differ. Read a range that does not exist and look at the exception response. Save a snapshot with `modbus save` and restore it. Then capture the traffic with Wireshark or tshark and match the packets to the operations you ran.

Once the data model is familiar, the interesting questions become system questions: who can reach the server, which registers are writable, what happens when a write is accepted, and whether the network path is protected.

For the radio piece in this set, read [Sub-GHz radio for beginners](/posts/sub-ghz-radio-cc1101-basics).

## Sources

1. [Modbus Organization FAQ](https://www.modbus.org/faq), for the protocol's origins, common uses and TCP/IP transport.
2. [Modbus/TCP Security Protocol Specification](https://www.modbus.org/file/secure/modbussecurityprotocol.pdf), for the TLS-based profile referenced above.
3. [modbus client and simulator README, pinned revision](https://github.com/DarkSoulEngineer/modbus/blob/2db3e66f30ab94ba396d30744bae6e0c43e1a212/README.md), for installation, addressing, simulator defaults and protocol limits.
