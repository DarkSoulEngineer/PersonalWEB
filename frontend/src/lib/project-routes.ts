const PROJECT_SLUGS: Record<number, string> = {
  1: "cc1101-driver",
  2: "modbus",
  8: "rtsp-to-http",
};

export function projectDetailPath(id: number): string | undefined {
  const slug = PROJECT_SLUGS[id];
  return slug ? `/projects/${slug}` : undefined;
}
