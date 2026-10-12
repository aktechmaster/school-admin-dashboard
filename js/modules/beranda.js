function updateDashboardKPI() {
    document.getElementById('kpi-siswa').innerText = (localData.Siswa || []).length;

    // Filter hanya menghitung ID Guru yang berawalan 'gr_' atau 'gr-'
    const totalGuru = (localData.Guru || []).filter(g => {
        const id = String(g.id_guru || '').toLowerCase();
        return id.startsWith('gr_') || id.startsWith('gr-');
    }).length;
    document.getElementById('kpi-guru').innerText = totalGuru;

    document.getElementById('kpi-kelas').innerText = (localData.Kelas || []).length;

    // Filter hanya menghitung ID Mapel yang berawalan 'mp_' atau 'mp-'
    const totalMapel = (localData.Mapel || []).filter(m => {
        const id = String(m.id_mapel || '').toLowerCase();
        return id.startsWith('mp_') || id.startsWith('mp-');
    }).length;
    document.getElementById('kpi-mapel').innerText = totalMapel;
}
