const json = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
};

const readBody = async (req) => {
  if (req.body && typeof req.body === "object") return req.body;

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error("Invalid JSON body.");
  }
};

const clean = (value, max = 4000) =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, max);

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  const apiKey = process.env.MAILGUN_API_KEY;
  const domain = process.env.MAILGUN_DOMAIN;
  const rawApiBase =
    process.env.MAILGUN_API_BASE_URL || "https://api.mailgun.net/v3";
  const apiBase = rawApiBase
    .replace(/\/v\d+\/?$/, "")
    .replace(/\/$/, "");
  const toEmail = process.env.CONTACT_TO_EMAIL || process.env.CONTACT_EMAIL;
  const fromEmail =
    process.env.MAILGUN_FROM_EMAIL ||
    (domain ? `Portfolio Contact <postmaster@${domain}>` : "");

  if (!apiKey || !domain || !toEmail || !fromEmail) {
    return json(res, 500, { error: "Contact form is not configured." });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    return json(res, 400, { error: error.message });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 200);
  const message = clean(body.message, 5000);

  if (!name || !email || !message) {
    return json(res, 400, { error: "Name, email, and message are required." });
  }

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!emailOk) {
    return json(res, 400, { error: "Enter a valid email address." });
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
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: mailgunBody.toString(),
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Mailgun error:", detail);
      return json(res, 502, { error: "Unable to send message right now." });
    }

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("Contact endpoint error:", error);
    return json(res, 502, { error: "Unable to send message right now." });
  }
};
