import { supabase } from "@/lib/supabase";
import { getWindowEndMinutes } from "@/lib/attendance";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return Response.json(
      { success: false, message: "Token tidak ditemukan" },
      { status: 400 }
    );
  }

  const { data: qrToken, error: tokenError } = await supabase
    .from("qr_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (tokenError || !qrToken) {
    return Response.json(
      { success: false, message: "Token tidak valid" },
      { status: 404 }
    );
  }

  return Response.json({
    success: true,
    qrToken: {
      id: qrToken.id,
      officer_name: qrToken.officer_name,
      role: qrToken.role,
      prayer: qrToken.prayer,
      prayer_time: qrToken.prayer_time,
      attendance_date: qrToken.attendance_date,
      used: qrToken.used,
      expires_at: qrToken.expires_at,
    },
  });
}

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return Response.json(
        { success: false, message: "Token tidak valid" },
        { status: 400 }
      );
    }

    const { data: qrToken, error: tokenError } = await supabase
      .from("qr_tokens")
      .select("*")
      .eq("token", token)
      .single();

    if (tokenError || !qrToken) {
      return Response.json(
        { success: false, message: "Token tidak ditemukan" },
        { status: 404 }
      );
    }

    if (qrToken.used) {
      return Response.json(
        { success: false, message: "QR code sudah digunakan" },
        { status: 400 }
      );
    }

    if (new Date(qrToken.expires_at) < new Date()) {
      return Response.json(
        { success: false, message: "QR code sudah expired" },
        { status: 400 }
      );
    }

    const now = new Date();
    const scanTime = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Jakarta",
    });

    const windowEndMinutes = getWindowEndMinutes(
      qrToken.role,
      qrToken.prayer_time,
      qrToken.prayer
    );

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const status =
      currentMinutes <= windowEndMinutes ? "HADIR" : "TERLAMBAT";

    const { data: attendanceData, error: insertError } = await supabase
      .from("attendance")
      .insert([
        {
          officer_name: qrToken.officer_name,
          role: qrToken.role,
          prayer: qrToken.prayer,
          prayer_time: qrToken.prayer_time,
          status,
          scan_time: scanTime,
          attendance_date: qrToken.attendance_date,
        },
      ])
      .select();

    if (insertError) {
      console.error("INSERT ATTENDANCE ERROR:", insertError);
      return Response.json(
        { success: false, message: "Gagal menyimpan absensi" },
        { status: 500 }
      );
    }

    await supabase
      .from("qr_tokens")
      .update({ used: true, used_at: new Date().toISOString() })
      .eq("id", qrToken.id);

    return Response.json({
      success: true,
      message: "Absensi berhasil disimpan",
      attendance: attendanceData[0],
    });
  } catch (error) {
    console.error("APPROVE ERROR:", error);
    return Response.json(
      { success: false, message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
