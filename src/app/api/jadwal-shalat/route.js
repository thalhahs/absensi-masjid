import { MOSQUE_CITY_ID, MOSQUE_CITY_NAME } from '@/lib/mosque-config';
import { PRAYER_TIME_KEYS } from '@/lib/attendance';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date =
    searchParams.get('date') || new Date().toISOString().slice(0, 10);

  try {
    const response = await fetch(
      `https://api.myquran.com/v2/sholat/jadwal/${MOSQUE_CITY_ID}/${date}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      return Response.json(
        { success: false, error: 'Gagal mengambil jadwal shalat' },
        { status: 502 }
      );
    }

    const payload = await response.json();
    const jadwal = payload?.data?.jadwal;

    if (!jadwal) {
      return Response.json(
        { success: false, error: 'Data jadwal tidak ditemukan' },
        { status: 404 }
      );
    }

    const times = {};
    for (const [id, key] of Object.entries(PRAYER_TIME_KEYS)) {
      times[id] = jadwal[key] ?? null;
    }

    return Response.json({
      success: true,
      date,
      lokasi: payload.data.lokasi || MOSQUE_CITY_NAME,
      daerah: payload.data.daerah,
      tanggal: jadwal.tanggal,
      times,
    });
  } catch {
    return Response.json(
      { success: false, error: 'Koneksi ke sumber jadwal gagal' },
      { status: 500 }
    );
  }
}
