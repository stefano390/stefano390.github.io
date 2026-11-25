(() => {
  const dentists = ["PROFESIONAL A", "PROFESIONAL B"];
  const plans = [
    { codigo: "PLAN_DEMO", nombre: "Cobertura de ejemplo", practices: [
      { codigo: "A01", nombre: "Consulta de control", precio: 18000, precioB: 3000 },
      { codigo: "A02", nombre: "Limpieza dental", precio: 24000, precioB: 4000 },
    ] },
    { codigo: "PARTICULAR", nombre: "Particular", practices: [
      { codigo: "P01", nombre: "Consulta de control", precio: 22000, precioB: 0 },
      { codigo: "P02", nombre: "Placa de descanso", precio: 65000, precioB: -18000 },
    ] },
  ];
  const records = [];
  function addService(data, date = new Date()) {
    const plan = plans.find(p => p.codigo === data.obraSocial);
    const practice = plan?.practices.find(p => p.codigo === data.prestacion);
    if (!practice || !dentists.includes(data.odontologo) || !data.paciente.trim()) {
      return { exito: false, mensaje: "Completá paciente, profesional y prestación." };
    }
    const cashDiscount = plan.codigo === "PARTICULAR" && data.medioPago === "Efectivo";
    const precio = practice.precio * (cashDiscount ? 0.9 : 1);
    const base = precio * (plan.codigo === "PLAN_DEMO" ? 0.868 : 1) + practice.precioB;
    records.push({ ...data, fila: records.length + 1, fecha: date.toLocaleDateString("es-AR"),
      period: date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0"),
      obraSocial: plan.nombre, prestacion: practice.nombre, codigo: practice.codigo, precio,
      coseguro: practice.precioB, comision: Math.round(base * 0.4 * 100) / 100, paid: false });
    return { exito: true, mensaje: "Prestación registrada en la demo." };
  }

  function group(rows, key) {
    const groups = new Map();
    for (const row of rows) {
      const nombre = row[key];
      const item = groups.get(nombre) || { nombre, cantidad: 0, totalFacturado: 0, comisiones: 0, pagado: 0, pendiente: 0 };
      item.cantidad++;
      item.totalFacturado += row.precio;
      item.comisiones += row.comision;
      item[row.paid ? "pagado" : "pendiente"] += row.comision;
      groups.set(nombre, item);
    }
    return [...groups.values()].sort((a,b) => b.totalFacturado - a.totalFacturado);
  }

  window.dentalDemo = {
    obtenerOdontologos: () => [...dentists],
    obtenerObrasSociales: () => plans.map(({codigo, nombre, practices}) => ({codigo, nombre, cantidad: practices.length})),
    obtenerPrestacionesPorObraSocial: codigo => plans.find(p => p.codigo === codigo)?.practices || [],
    agregarOdontologo(nombre) {
      if (!nombre || dentists.includes(nombre)) return { exito: false, mensaje: "Ingresá un nombre nuevo." };
      dentists.push(nombre);
      return { exito: true, mensaje: "Profesional agregado al equipo." };
    },
    guardarPrestacion: data => addService(data, new Date(data.fechaAtencion + "T12:00:00")),
    obtenerPrestacionesPendientes: () => records.filter(row => !row.paid),
    marcarComoPagadas(filas) {
      for (const row of records) if (filas.includes(row.fila)) row.paid = true;
      return { mensaje: "Se actualizaron los pagos de la demo." };
    },
    obtenerMesesDisponibles() {
      return [...new Set(records.map(row => row.period))].sort().reverse().map(valor => ({
        valor, label: new Date(valor + "-15T12:00:00").toLocaleDateString("es-AR", {month: "long", year: "numeric"}),
      }));
    },
    obtenerDatosReporteMensual(year, month) {
      const period = year + "-" + String(month).padStart(2, "0");
      const rows = records.filter(row => row.period === period);
      const rankingOdontologos = group(rows, "odontologo");
      const sum = key => rankingOdontologos.reduce((total, item) => total + item[key], 0);
      return { exito: !!rows.length, metricas: { totalPrestaciones: rows.length,
        totalFacturado: sum("totalFacturado"), totalComisiones: sum("comisiones"),
        totalPagado: sum("pagado"), totalPendiente: sum("pendiente"),
        rankingOS: group(rows, "obraSocial"), rankingOdontologos } };
    },
  };
  for (const [i, plan] of plans.entries()) {
    addService({ odontologo: dentists[i], paciente: "Paciente de ejemplo " + (i + 1), dni: "",
      obraSocial: plan.codigo, prestacion: plan.practices[0].codigo, medioPago: "Efectivo" });
  }
  const previousMonth = new Date();
  previousMonth.setDate(1);
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  addService({ odontologo: dentists[0], paciente: "Paciente de ejemplo 3", dni: "",
    obraSocial: "PLAN_DEMO", prestacion: "A02", medioPago: "Transferencia" }, previousMonth);
  records[2].paid = true;
  window.addEventListener("pageshow", event => { if (event.persisted) location.reload(); });
})();
