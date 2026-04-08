Karena Notflix kemungkinannya dibangun pakai React/Next.js, di sini saya akan pandu langkah demi langkah untuk menyambungkan semua "kekuatan" Vidstack yang baru saja kita rombak ke dalam struktur file ../notflix khusus di folder video/nativeplayer.

Semua fitur baru (Grup tengah, tombol Episodes, dan deteksi otomatis Bendera di Subtitle) sudah tertanam di core UI Vidstack. Artinya, di React kamu cukup melempar data dinamis (seperti URL video dan teks subtitle) dan UI-nya akan otomatis bekerja tanpa perlu coding CSS lagi.

Berikut panduan integrasinya ke Notflix:

1. Masukkan Vidstack Rombakan ke Notflix
   Daripada pakai @vidstack/react bawaan internet, kita asumsikan kamu pakai hasil build lokal dari folder vidstack-edit ini ke repo notflix.

Buka terminal di dalam folder notflix dan jalankan:

bash
npm install "file:../vidstack-edit/packages/vidstack"
npm install "file:../vidstack-edit/packages/react"
(Atau langsung copy folder packages/vidstack/dist-npm/ dan packages/react/dist-npm/ ke dalam folder Notflix bila kamu setup monorepo yang berbeda).

2. Copy Custom CSS
   Copy file custom-player.css (yang isinya variabel warna brand Notflix dsb) dari project ini ke dalam Notflix, misalnya di src/app/globals.css atau folder styles Notflix. Pastikan warna --video-brand diset ke merah Notflix (#e50914).

3. Setup Komponen di video/nativeplayer/NativePlayer.tsx
   Di dalam komponen player Notflix kamu, import player dari @vidstack/react dan buat ref untuk menangkap custom event episodes.

tsx
'use client'; // Jika pakai Next.js App Router
import React, { useRef, useEffect } from 'react';
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import './custom-player.css'; // File CSS Notflix override yang tadi kita buat
import { MediaPlayer, MediaProvider, Track, type MediaPlayerInstance } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
export default function NativePlayer({ videoData, subtitlesData }) {
const playerRef = useRef<MediaPlayerInstance>(null);
useEffect(() => {
// Menangkap Event 📺 EPISODES yang kita buat di source code tadi!
const player = playerRef.current;
if (!player) return;
const onEpisodesOpen = () => {
console.log('User klik Episodes!');
// TODO: PANGGIL STATE DRAWER/MODAL TERBANG NOTFLIX DI SINI
// openEpisodeDrawer(videoData.seriesId);
};
player.addEventListener('vds-episodes-open', onEpisodesOpen);

    return () => {
      player.removeEventListener('vds-episodes-open', onEpisodesOpen);
    };

}, []);
return (

<div className="player-wrapper w-full aspect-video">
<MediaPlayer
ref={playerRef}
title={videoData.title} // Judul Otomatis muncul
src={videoData.videoUrl} // Contoh: HLS / MP4
crossOrigin
playsInline
poster={videoData.posterUrl} >
<MediaProvider />
{/_
🌟 DYNAMIC SUBTITLES SEKALIGUS BENDERA OTOMATIS
Karena source code Vidstack sudah kita rombak,
dia akan otomatis nge-detect label="English" lalu merendernya
menjadi: [ 🇬🇧 English ] di dalam menu Settings > Captions !!
_/}
{subtitlesData.map((sub, index) => (
<Track
key={index}
src={sub.src}
kind="subtitles"
label={sub.languageName} // Contoh: "English", "Indonesian"
srcLang={sub.langCode} // Contoh: "en", "id"
default={index === 0} // Auto-on untuk index 0
/>
))}
{/_
UI Rombakan Kita (Seek bawah, Play bawah, tombol Episode, slider modern)
otomatis aktif dengan memanggil DefaultVideoLayout.
_/}
<DefaultVideoLayout 
           icons={defaultLayoutIcons} 
           thumbnails={videoData.thumbnailsUrl} 
        />
</MediaPlayer>
</div>
);
}
Mengapa ini bekerja dengan sempurna?
Dynamic Flags: Ingat variabel LANG_FLAGS yang saya sisipkan di source code captions-menu.ts? Saat React (Notflix) me-mapping data dari database ke props label milik komponen <Track>, layout internal Vidstack akan membaca string tersebut (misal "Indonesian"), lalu mencari kamus negaranya, dan langsung memunculkan "🇮🇩" di menu!
Seek Step: Di dalam <MediaPlayer>, seek secara default otomatis mundur-maju 5 detik persis sesuai rombakan konfigurasi yang pertama kali kita tanamkan di props.ts.
Episode Seamless: Cukup listen DOM Event bawaan yang bernama vds-episodes-open, UI tidak perlu di-hack dengan absolute positioning React. Tombolnya menempel persis di barisan kontrol Vidstack dengan responsif mobile/desktop bawaan native-nya!
Karena semua "senjata" kustom kita taruh di dasar library/framework Vidstack langsung, kode React Notflix kamu akan tetap sangat gampang dibaca, deklaratif, dan performanya setara dengan Netflix asli!
