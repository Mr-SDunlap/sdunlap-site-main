const clean = (val, max = 4000) =>
  String(val || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);

  if (!name || !email || !message) {
    return Response.json(
      { error: "Name, email, and message are required." },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }

  const apiKey = env.MAILGUN_API_KEY;
  const domain = env.MAILGUN_DOMAIN;
  const rawApiBase = env.MAILGUN_API_BASE_URL || "https://api.mailgun.net/v3";
  const apiBase = rawApiBase.replace(/\/v\d+\/?$/, "").replace(/\/$/, "");
  const toEmail = env.CONTACT_TO_EMAIL || env.CONTACT_EMAIL;
  const fromEmail =
    env.MAILGUN_FROM_EMAIL ||
    (domain ? `Portfolio Contact <postmaster@${domain}>` : "");

  if (!apiKey || !domain || !toEmail || !fromEmail) {
    return Response.json(
      { error: "Contact form is not configured." },
      { status: 500 },
    );
  }

  const mailgunBody = new URLSearchParams({
    from: fromEmail,
    to: toEmail,
    subject: `Portfolio contact from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    "h:Reply-To": email,
  });

  try {
    const response = await fetch(`${apiBase}/v3/${domain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`api:${apiKey}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: mailgunBody.toString(),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Mailgun error:", detail);
      return Response.json(
        { error: "Unable to send message right now." },
        { status: 502 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Contact endpoint error:", error);
    return Response.json(
      { error: "Unable to send message right now." },
      { status: 502 },
    );
  }
}
