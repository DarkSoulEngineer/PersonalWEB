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
  walkthrough?: {
    title: string;
    description: string;
    commands?: string[];
  }[];
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
    title: "RTSP_TO_HTTP: a lab camera stream on a smart TV",
    metaTitle: "RTSP to HTTP: HiveHack Camera Streaming Lab",
    description: "HiveHack @ CyberSea walkthrough: authorized LAN reconnaissance, RTSP credential audit, FFmpeg HLS conversion and browser playback on a Samsung smart TV.",
    reviewedAt: "2026-11-15",
    problem: [
      "The HiveHack room at CyberSea included a router, an IP camera and an older Samsung smart TV. The task was to get the camera feed onto the TV, which had a browser but no native RTSP support.",
      "The camera exposed RTSP on its default port and accepted default credentials. That made the challenge a lesson in discovery and configuration, not a sophisticated exploit. The remaining problem was compatibility: RTSP is not something the TV browser can play, so the stream needed conversion and an HTTP delivery path.",
      "RTSP_TO_HTTP packages that path: a credential-audit script for the authorized lab camera, an FFmpeg pipeline that turns RTSP into HLS, and a Python server that makes the playlist and segments available to a browser.",
    ],
    architecture: [
      { title: "Challenge LAN", description: "A wired Ethernet connection to the HiveHack router, with the camera and smart TV on the same local network." },
      { title: "RTSP discovery and access", description: "Scan for TCP port 554, then test default credentials against the lab camera." },
      { title: "FFmpeg HLS bridge", description: "Read the authenticated RTSP stream and transcode it into a playlist and short .ts segments." },
      { title: "Python HTTP server", description: "Serve the player, playlist and segments on port 8000 with HLS MIME types." },
      { title: "Samsung TV browser", description: "Open the server URL on the TV and play the HLS stream without native RTSP support." },
    ],
    architectureCaption: "The camera stream never reaches the TV directly. FFmpeg turns RTSP into HLS files, and the TV browser fetches them over HTTP. The bridge adds compatibility, not authentication.",
    walkthrough: [
      {
        title: "Find the camera on the LAN",
        description: "The challenge provided physical access to the router, camera and TV, so I used a wired connection instead of attacking Wi-Fi. A scan limited to the standard RTSP port was enough to locate the camera.",
        commands: ["nmap -p 554 192.168.1.0/24"],
      },
      {
        title: "Audit the RTSP credentials",
        description: "The camera accepted default credentials. rtsp_crack.py drives ffmpeg with a short read timeout and classifies the result from the error output. It is a lab helper for an authorized device, not a general-purpose attack tool.",
        commands: ["python3 crack/rtsp_crack.py --target CAMERA_IP --userlist crack/users.txt --passlist crack/passwords.txt --path stream1"],
      },
      {
        title: "Verify the stream",
        description: "Before changing formats, I opened the RTSP URL in VLC and ffplay to confirm that the credentials worked and the live feed was playable.",
        commands: ['ffplay "rtsp://USER:PASSWORD@CAMERA_IP:554/stream1"'],
      },
      {
        title: "Convert RTSP to HLS",
        description: "live_stream.sh loads the camera settings from .env, removes old segments, and runs FFmpeg with 1920x1080 output, H.264 at 25 fps, a 1 Mbps target, CRF 31, AAC audio and five-second HLS segments.",
        commands: ["bash live_stream.sh"],
      },
      {
        title: "Serve the playlist over HTTP",
        description: "server.py serves the project directory on port 8000, registers the HLS MIME types and prints the LAN address to open on another device.",
        commands: ["python server.py", "http://LOCAL_IP:8000"],
      },
      {
        title: "Play it on the TV",
        description: "The Samsung TV browser loaded the player page and played the HLS stream. Pause and play worked; the goal was live display rather than a full media interface.",
      },
    ],
    implementation: [
      "rtsp_crack.py runs ffmpeg with -rtsp_transport tcp, a three-second read and a ten-second process timeout, then classifies the result from ffmpeg stderr. The repository includes small lab username and password lists for the challenge.",
      "live_stream.sh and live_stream.bat wrap the same FFmpeg invocation. The shell version deletes old .ts files before starting and sources the camera settings from .env.",
      "server.py subclasses SimpleHTTPRequestHandler to add application/x-mpegURL and video/MP2T MIME types, plus a permissive Access-Control-Allow-Origin header.",
      "index.html is a minimal browser player for the generated playlist. The TV never connects to the RTSP source; it only requests HLS files from the Python server.",
    ],
    securityTakeaways: [
      "Default credentials and an exposed RTSP port were enough to reach the camera feed. Change defaults, disable unused services and keep surveillance devices on a restricted network segment.",
      "The bridge inherits the source's weaknesses. FFmpeg reads a plaintext RTSP stream, and the demo HTTP server serves the result without authentication or TLS.",
      "The server allows any origin and prints its LAN address for convenience. That is acceptable on an isolated challenge network, not on a shared or public one.",
      "The sample .env contains challenge credentials, and live_stream.sh writes the RTSP URL to the terminal. For real use, keep secrets in an untracked file and avoid writing them to logs.",
    ],
    limitations: "This was a CTF-style challenge, not a production deployment. The camera, router and TV were provided for the HiveHack room, and the workflow was not tested against arbitrary devices. The FFmpeg settings trade image quality and CPU for compatibility. server.py is a teaching server, not a hardened media service, and this page does not host a live feed or expose credentials.",
    sources: [
      { label: "HiveHack walkthrough: IoT challenge, RTSP to HTTP", url: "https://www.hivehack.tech/post/iot-hacking-challenge-walkthrough-rtsp-to-http" },
      { label: "README: workflow, configuration and usage", url: "https://github.com/DarkSoulEngineer/RTSP_TO_HTTP/blob/106fb39566c37d1be19102b9fdf4171dba1ff7d9/readme.md" },
      { label: "Python HTTP server at reviewed commit", url: "https://github.com/DarkSoulEngineer/RTSP_TO_HTTP/blob/106fb39566c37d1be19102b9fdf4171dba1ff7d9/server.py" },
      { label: "FFmpeg launcher at reviewed commit", url: "https://github.com/DarkSoulEngineer/RTSP_TO_HTTP/blob/106fb39566c37d1be19102b9fdf4171dba1ff7d9/live_stream.sh" },
      { label: "RTSP credential-audit script at reviewed commit", url: "https://github.com/DarkSoulEngineer/RTSP_TO_HTTP/blob/106fb39566c37d1be19102b9fdf4171dba1ff7d9/crack/rtsp_crack.py" },
    ],
  },
];

export function getProjectCaseStudy(slug: string): ProjectCaseStudy | undefined {
  return PROJECT_CASE_STUDIES.find((study) => study.slug === slug);
}
