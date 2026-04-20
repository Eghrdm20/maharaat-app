if (!adminUid) {
  return NextResponse.json(
    { error: "ADMIN_PI_UID is missing in Vercel" },
    { status: 500 }
  )
}

if (!piUid) {
  return NextResponse.json(
    { error: "pi_uid cookie is missing. Please log out and log in again." },
    { status: 401 }
  )
}

if (piUid !== adminUid) {
  return NextResponse.json(
    {
      error: "Your Pi UID does not match ADMIN_PI_UID",
      currentPiUid: piUid,
    },
    { status: 403 }
  )
}
