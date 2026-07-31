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
      officer_id: qrToken.officer_id,
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token, officerId, replacement } = body;

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

    if (currentMinutes > windowEndMinutes) {
      return Response.json(
        { success: false, message: "Scan di luar window waktu. Absen ditolak." },
        { status: 400 }
      );
    }

    let officerName = qrToken.officer_name || "Unknown";
    let officerRole = qrToken.role || "Imam";

    if (officerId && replacement) {
      const { data: officerData, error: officerError } = await supabase
        .from("officers")
        .select("id, name, role")
        .eq("id", officerId)
        .single();

      if (officerError || !officerData) {
        return Response.json(
          { success: false, message: "Petugas tidak ditemukan" },
          { status: 404 }
        );
      }

      officerName = officerData.name;
      officerRole = officerData.role || officerRole;

      const { data: assignment, error: assignmentError } = await supabase
        .from("schedule_assignments")
        .select("*")
        .eq("date", qrToken.attendance_date)
        .eq("prayer_id", qrToken.prayer)
        .or(`imam_id.eq.${officerId},muadzin_id.eq.${officerId},badal_imam_id.eq.${officerId}`)
        .single();

      if (assignmentError || !assignment) {
        const { data: allAssignments, error: allAssignmentsError } = await supabase
          .from("schedule_assignments")
          .select("imam_id, muadzin_id, badal_imam_id")
          .eq("date", qrToken.attendance_date)
          .eq("prayer_id", qrToken.prayer)
          .single();

        if (allAssignmentsError || !allAssignments) {
          return Response.json(
            { success: false, message: "Jadwal shalat tidak ditemukan" },
            { status: 404 }
          );
        }

        const options = [];
        if (allAssignments.imam_id) {
          const { data: imam } = await supabase.from("officers").select("id, name, role").eq("id", allAssignments.imam_id).single();
          if (imam) options.push(imam);
        }
        if (allAssignments.muadzin_id) {
          const { data: muadzin } = await supabase.from("officers").select("id, name, role").eq("id", allAssignments.muadzin_id).single();
          if (muadzin) options.push(muadzin);
        }
        if (allAssignments.badal_imam_id) {
          const { data: badal } = await supabase.from("officers").select("id, name, role").eq("id", allAssignments.badal_imam_id).single();
          if (badal) options.push(badal);
        }

        return Response.json({
          success: false,
          needsReplacement: true,
          message: "Anda tidak dijadwalkan pada waktu ini",
          options,
        });
      }
    }

    const { data: attendanceData, error: insertError } = await supabase
      .from("attendance")
      .insert([
        {
          officer_id: officerId || qrToken.officer_id || null,
          officer_name: officerName,
          role: officerRole,
          prayer: qrToken.prayer,
          prayer_time: qrToken.prayer_time,
          status: "HADIR",
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
