export interface ProjectCaseStudy {
  projectId: number;
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  reviewedAt: string;
  problem: string[];
  architecture: { title: string; description: string }[];
  architectureCaption: string;
  implementation: string[];
  securityTakeaways: string[];
  limitations: string;
  sources: { label: string; url: string }[];
  license?: string;
}

// Editorial summaries of the linked source snapshots, not claims of production
// deployment, measured RF performance, or security certification.
export const PROJECT_CASE_STUDIES: ProjectCaseStudy[] = [
  {
    projectId: 1,
    slug: "cc1101-driver",
    title: "CC1101_DRIVER: ESP32-S3 radio driver and RF research",
    metaTitle: "CC1101 ESP32-S3 Radio Driver",
    description: "An ESP-IDF C driver for CC1101 radios on ESP32-S3: handle-based SPI control, receive paths, architecture and RF security considerations.",
    reviewedAt: "2026-11-15",
    problem: [
      "Working with a sub-GHz radio involves more than choosing a frequency. Firmware must configure the transceiver, coordinate access to its registers and FIFOs, and distinguish received data from a valid packet. Those responsibilities become more important when two radios share a microcontroller and SPI bus.",
      "CC1101_DRIVER separates the reusable chip driver from board initialization and the RFuzz application. Its handle-based API lets the application address individual CC1101 modules while controlling frequency, channel, data rate, transmit power and packet settings. The documented setup uses an ESP32-S3 and two CC1101 modules.",
    ],
    architecture: [
      { title: "UART console", description: "Operator requests receive modes and coordinated modulation profiles." },
      { title: "RFuzz application", description: "ESP32-S3 application coordinates radio state and reports received data." },
      { title: "ESP-IDF C driver", description: "Handles, command strobes, register access and FIFO operations." },
      { title: "CC1101 radios", description: "Shared SPI bus with separate chip-select and GDO0 connections." },
    ],
    architectureCaption: "Simplified control path. Received data returns through the driver to the application; raw receive capture uses the ESP32-S3 RMT peripheral.",
    implementation: [
      "The driver wraps the CC1101 register interface in C. Each handle identifies its SPI device and control pins, keeping chip operations separate from the board-specific initialization component.",
      "The hardware layer initializes the shared SPI bus and coordinates access with a mutex. Separate chip-select lines allow the application to address each radio without treating the pair as a single device.",
      "The packet receive path reports the hardware CRC outcome. A separate raw path captures digital demodulator level/duration data through RMT; it is not an I/Q receiver or an automatic decoder for arbitrary wireless protocols.",
      "The referenced lean RFuzz firmware configures Radio A but leaves it idle, while Radio B listens and reports received data. It does not automatically transmit or compare received packets against a golden payload.",
    ],
    securityTakeaways: [
      "A valid CRC detects transmission errors; it does not establish sender identity, authenticate a command or prevent replay. Protocol-level security needs separate analysis.",
      "Explicit radio state and bounded capture/output paths matter when handling malformed or unexpected input. Report observed capture loss and gaps rather than assuming a continuous waveform.",
      "RF work requires authorization and compliance with the applicable frequency, power and duty-cycle rules. A register setting is not evidence of compliant radiated power.",
    ],
    limitations: "This is a research driver and console, not a certified radio product. The README distinguishes historical hardware evidence from later source changes. The current lean firmware and candidate profiles are not presented here as hardware-validated, lossless, or compliant with a measured RF power target.",
    sources: [
      { label: "README and validation limits at reviewed commit", url: "https://github.com/DarkSoulEngineer/CC1101_DRIVER/blob/0656de50adbf87d35de05eed8db9b64a78473e82/README.md" },
      { label: "Reusable CC1101 driver component", url: "https://github.com/DarkSoulEngineer/CC1101_DRIVER/tree/0656de50adbf87d35de05eed8db9b64a78473e82/components/cc1101" },
    ],
    license: "https://opensource.org/license/mit",
  },
  {
    projectId: 2,
    slug: "modbus",
    title: "modbus: a Python CLI for industrial protocol testing",
    metaTitle: "Modbus CLI for OT Security Testing",
    description: "A Python Modbus CLI for authorized OT testing, with network and serial transports, register inspection, a lab simulator and security takeaways.",
    reviewedAt: "2026-11-15",
    problem: [
      "Industrial devices expose values through registers and coils, but interpreting them requires the correct address notation, register type, byte order, word order and datatype. A successful connection alone does not prove that the value being read or written has been interpreted correctly.",
      "The modbus project provides a command-line client for PLCs, VFDs, energy meters and RTUs. It combines protocol-aware operations, readable terminal output and machine-readable JSON so the same workflow can support an interactive lab session or a controlled automation script.",
    ],
    architecture: [
      { title: "CLI or interactive shell", description: "Select a connection, operation, address range and datatype." },
      { title: "Validation and conversion", description: "Resolve register notation, protocol limits, byte order and scale." },
      { title: "pymodbus transport", description: "Use TCP, UDP, serial RTU/ASCII, or TLS according to the target." },
      { title: "Simulator or authorized device", description: "Exchange protocol requests and responses within an approved scope." },
    ],
    architectureCaption: "Simplified request path. Responses are decoded into rich terminal output or JSON; diagnostics remain separate from machine-readable stdout.",
    implementation: [
      "Read, scan and watch operations support inspecting register ranges and observing changes. Write, fill and restore operations can modify writable device state and must be treated differently from read-only inspection.",
      "Datatype conversion covers integers, floating-point values and strings, with configurable byte order, word order and scaling. Standard register notation is converted to the underlying protocol offsets.",
      "The client enforces documented function-code limits before sending requests and provides deterministic exit codes for usage errors, connection failures, protocol exceptions and timeouts.",
      "An embedded TCP/UDP simulator provides changing sensor values for local experimentation. The interactive shell supports named connections and session settings, while JSON output supports scripted workflows.",
    ],
    securityTakeaways: [
      "Traditional Modbus deployments should not be assumed to provide authentication or confidentiality. Network segmentation and access control remain important even when a client can successfully exchange requests.",
      "Write, fill and restore operations can affect physical processes. Use the simulator first, define authorization and change boundaries, and do not treat an industrial production network as a test environment.",
      "When TLS is used, verify the server certificate and protect client keys. An optional certificate-verification bypass is a diagnostic exception, not a secure deployment default.",
    ],
    limitations: "A protocol client is not a complete OT security assessment. Device-specific register maps, safety constraints, operational approvals and the surrounding network architecture still determine what can be tested safely. No production-device assessment or certification is claimed by this case study.",
    sources: [
      { label: "README: transports, commands, output and limits", url: "https://github.com/DarkSoulEngineer/modbus/blob/2db3e66f30ab94ba396d30744bae6e0c43e1a212/README.md" },
      { label: "Project source tree at reviewed commit", url: "https://github.com/DarkSoulEngineer/modbus/tree/2db3e66f30ab94ba396d30744bae6e0c43e1a212/src" },
    ],
    license: "https://opensource.org/license/mit",
  },
  {
    projectId: 8,
    slug: "rtsp-to-http",
    title: "RTSP_TO_HTTP: camera streams from RTSP to browser HLS",
    metaTitle: "RTSP to HTTP: HLS Camera Streaming",
    description: "An authorized camera-streaming pipeline using FFmpeg, HLS and a Python HTTP server, with architecture and practical camera-security considerations.",
    reviewedAt: "2026-11-15",
    problem: [
      "An IP camera may publish video over RTSP while the intended viewing device expects browser-friendly HTTP delivery. Bridging those interfaces requires both a media-processing step and a way to serve the resulting stream.",
      "RTSP_TO_HTTP was inspired by the HiveHack challenge at CyberSea. This case study focuses on the authorized streaming workflow: FFmpeg reads an RTSP source, produces HLS output, and a Python HTTP server makes that output available to a browser player or compatible smart TV.",
    ],
    architecture: [
      { title: "Authorized RTSP camera", description: "An approved camera source and its connection configuration." },
      { title: "FFmpeg bridge", description: "Read the RTSP stream and produce browser-oriented HLS output." },
      { title: "HLS files and HTTP server", description: "Serve the .m3u8 playlist and .ts media segments using Python." },
      { title: "Browser or smart TV", description: "Load the playlist through the included browser player." },
    ],
    architectureCaption: "Media flows from an approved RTSP source through FFmpeg into HLS files, then over HTTP to the viewing device. This is a compatibility bridge, not an added authentication layer.",
    implementation: [
      "The repository includes Linux/macOS shell and Windows batch launchers for the FFmpeg streaming step, alongside an HTML player and Python HTTP server.",
      "Stream connection and output settings are provided through environment configuration. HLS output consists of a playlist and media segments rather than a direct RTSP connection from the browser.",
      "The separation between media conversion and HTTP serving makes the pipeline easier to inspect: source access, generated files, web delivery and browser playback can be evaluated as distinct boundaries.",
      "The repository also documents credential-audit tooling for authorized lab exercises. That tooling is not a prerequisite for re-streaming a camera whose owner has supplied legitimate access.",
    ],
    securityTakeaways: [
      "Do not test or re-stream cameras without explicit authorization. Camera footage can expose sensitive personal or operational information.",
      "Protect both sides of the bridge. Securing the original RTSP endpoint does not automatically secure the HLS playlist and segments served over HTTP.",
      "Keep camera credentials out of version control, browser-delivered files and logs. For real deployments, add appropriate authentication, HTTPS and network restrictions around the streaming service.",
    ],
    limitations: "The documented HTTP demo is not presented as a hardened production video service. Browser and smart-TV compatibility still depends on the media codecs and player support. This portfolio page does not host a camera feed, expose camera credentials, or claim that conversion alone makes a stream secure.",
    sources: [
      { label: "README: scope and streaming workflow", url: "https://github.com/DarkSoulEngineer/RTSP_TO_HTTP/blob/106fb39566c37d1be19102b9fdf4171dba1ff7d9/readme.md" },
      { label: "Python HTTP server at reviewed commit", url: "https://github.com/DarkSoulEngineer/RTSP_TO_HTTP/blob/106fb39566c37d1be19102b9fdf4171dba1ff7d9/server.py" },
    ],
  },
];

export function getProjectCaseStudy(slug: string): ProjectCaseStudy | undefined {
  return PROJECT_CASE_STUDIES.find((study) => study.slug === slug);
}
