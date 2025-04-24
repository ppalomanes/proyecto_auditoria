$(document).ready(function () {
  fetch('http://localhost:3001/data')
    .then(res => res.json())
    .then(data => {
      if (!data.length) return $('#dataTable').html('<p>No hay datos.</p>');

      const columns = Object.keys(data[0]).map(key => ({ title: key, data: key }));

      // Null -> "—"
      data = data.map(row => {
        Object.keys(row).forEach(k => row[k] = row[k] ?? '—');
        return row;
      });

      $('#dataTable').DataTable({
        data,
        columns,
        dom: 'Bfrtip',
        buttons: ['copy', 'csv', 'excel', 'pdf', 'print', 'colvis'],
        responsive: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        stateSave: true,
        language: {
          url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
        }
      });
    })
    .catch(err => {
      console.error('🚨 Error al cargar datos:', err);
      $('#dataTable').html('<p>Error al obtener datos.</p>');
    });
});
