export async function GET() {
  return Response.json({
    data: {
      status: "ok",
      service: "lab-web",
      timestamp: new Date().toISOString(),
    },
    error: null,
    meta: {},
  });
}
