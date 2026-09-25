function updateDashboardKPI() {
    document.getElementById('kpi-siswa').innerText = (localData.Siswa || []).length;
    document.getElementById('kpi-guru').innerText = (localData.Guru || []).length;
    document.getElementById('kpi-kelas').innerText = (localData.Kelas || []).length;
    document.getElementById('kpi-mapel').innerText = (localData.Mapel || []).length;
}
