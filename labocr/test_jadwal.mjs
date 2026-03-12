const apiUrl = "http://127.0.0.1:8000/api/jadwal/public";

fetch(apiUrl)
  .then(res => res.json())
  .then(jadwal => {
    const sabtu = jadwal.filter(j => j.hari.toLowerCase() === 'sabtu');
    console.log("Sabtu schedules:", sabtu.length);

    const jamKuliah = [
      { start: "07:00", end: "09:00" },
      { start: "09:00", end: "11:00" },
      { start: "11:00", end: "13:00" },
      { start: "13:00", end: "15:00" },
      { start: "15:00", end: "17:00" },
      { start: "17:00", end: "18:00" },
    ];

    const timeToMin = (t) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const slotStartIndex = (time) => {
      const tMin = timeToMin(time ? time.slice(0, 5) : "");
      return jamKuliah.findIndex(slot => timeToMin(slot.end) > tMin);
    };

    const slotEndIndex = (time) => {
      const tMin = timeToMin(time ? time.slice(0, 5) : "");
      let idx = -1;
      for (let i = 0; i < jamKuliah.length; i++) {
        if (timeToMin(jamKuliah[i].start) < tMin) idx = i;
      }
      return idx;
    };

    const map = {};
    const col = 5; // Sabtu

    sabtu.forEach(s => {
      const rowStart = slotStartIndex(s.jamMulai);
      const rowEnd = slotEndIndex(s.jamSelesai);
      
      console.log(`id: ${s.id}, jam: ${s.jamMulai} - ${s.jamSelesai}, rowStart: ${rowStart}, rowEnd: ${rowEnd}`);

      const rowSpan = Math.max(1, rowEnd - rowStart + 1);

      if (!map[`${rowStart}-${col}`]) {
        map[`${rowStart}-${col}`] = [];
      }

      const existing = map[`${rowStart}-${col}`].find(m => m.item.id === s.id);
      if (!existing) {
        map[`${rowStart}-${col}`].push({ item: s, rowSpan });
      }

      for (let r = rowStart + 1; r < rowStart + rowSpan; r++) {
        if (!map[`${r}-${col}`]) {
          map[`${r}-${col}`] = [];
        }
        if (!map[`${r}-${col}`].find(m => m.item.id === s.id)) {
          map[`${r}-${col}`].push({ item: s, rowSpan: 0 });
        }
      }
    });

    console.log("Map for column 5:");
    Object.keys(map).sort().forEach(k => {
      console.log(k, map[k].map(c => `{id: ${c.item.id}, rowSpan: ${c.rowSpan}}`));
    });
  })
  .catch(err => console.error(err));
