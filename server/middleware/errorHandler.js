export function notFound(req, res) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err, req, res, next) {
  console.error(err);


  if (err?.code === "P2002") {
    return res.status(409).json({
      error: "Ten termin jest już zajęty dla wybranego terapeuty. Wybierz inną godzinę.",
    });
  }

  return res.status(err.status || 500).json({
    error: err.message || "Server error",
  });
}