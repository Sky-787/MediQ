jest.mock('../../src/models/Doctor', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../../src/models/User', () => ({
  findById: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

jest.mock('../../src/models/Appointment', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
  aggregate: jest.fn(),
}));

jest.mock('../../src/utils/response', () => ({
  sendSuccess: jest.fn(),
  sendCreated: jest.fn(),
  sendPaginated: jest.fn(),
}));

const Doctor = require('../../src/models/Doctor');
const User = require('../../src/models/User');
const Appointment = require('../../src/models/Appointment');
const responseUtils = require('../../src/utils/response');

const appointmentController = require('../../src/controllers/appointment.controller');
const doctorController = require('../../src/controllers/doctor.controller');
const userController = require('../../src/controllers/user.controller');
const reportController = require('../../src/controllers/report.controller');

const createRes = () => ({
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
});

const chain = (result) => {
  const sortable = {
    populate: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockResolvedValue(result),
  };
  return sortable;
};

describe('domain controllers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('appointment controller cubre ramas principales', async () => {
    const res = createRes();
    const next = jest.fn();

    Appointment.find.mockReturnValueOnce(chain([]));
    Appointment.countDocuments.mockResolvedValueOnce(0);
    await appointmentController.getAppointments({ user: { rol: 'paciente', id: 'p1' }, query: {} }, res, next);
    expect(responseUtils.sendPaginated).toHaveBeenCalled();

    Doctor.findOne.mockResolvedValueOnce(null);
    await appointmentController.getAppointments({ user: { rol: 'medico', id: 'm1' }, query: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    const notFoundChain = {
      populate: jest.fn().mockReturnThis(),
    };
    notFoundChain.populate.mockImplementationOnce(() => notFoundChain);
    notFoundChain.populate.mockImplementationOnce(() => Promise.resolve(null));
    Appointment.findById.mockReturnValueOnce(notFoundChain);
    await appointmentController.getAppointmentById({ params: { id: 'a1' }, user: { rol: 'paciente', id: 'p1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    const forbiddenChain = {
      populate: jest.fn().mockReturnThis(),
    };
    forbiddenChain.populate.mockImplementationOnce(() => forbiddenChain);
    forbiddenChain.populate.mockImplementationOnce(() => Promise.resolve({
      pacienteId: { _id: { toString: () => 'otro' } },
    }));
    Appointment.findById.mockReturnValueOnce(forbiddenChain);
    await appointmentController.getAppointmentById({ params: { id: 'a1' }, user: { rol: 'paciente', id: 'p1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);

    await appointmentController.createAppointment({
      body: { doctorId: 'd1', fechaHora: '2026-06-14T10:00:00.000Z', motivo: 'corto' },
      user: { id: 'p1' },
    }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    Doctor.findById.mockResolvedValueOnce(null);
    await appointmentController.createAppointment({
      body: { doctorId: 'd1', fechaHora: '2026-06-14T10:00:00.000Z', motivo: 'motivo suficientemente largo' },
      user: { id: 'p1' },
    }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    Doctor.findById.mockResolvedValueOnce({ _id: 'd1' });
    Appointment.findOne.mockResolvedValueOnce({ _id: 'exists' });
    await appointmentController.createAppointment({
      body: { doctorId: 'd1', fechaHora: '2026-06-14T10:00:00.000Z', motivo: 'motivo suficientemente largo' },
      user: { id: 'p1' },
    }, res, next);
    expect(res.status).toHaveBeenCalledWith(409);

    await appointmentController.updateAppointmentStatus({ user: { rol: 'paciente' }, body: { estado: 'confirmada' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);

    await appointmentController.updateAppointmentStatus({ user: { rol: 'admin' }, body: { estado: 'otro' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    Appointment.findByIdAndUpdate.mockResolvedValueOnce(null);
    await appointmentController.updateAppointmentStatus({ user: { rol: 'admin' }, body: { estado: 'confirmada' }, params: { id: 'a1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    Appointment.findByIdAndDelete.mockResolvedValueOnce(null);
    await appointmentController.deleteAppointment({ params: { id: 'a1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('doctor controller cubre paginación, 404 y duplicados', async () => {
    const res = createRes();
    const next = jest.fn();

    Doctor.find.mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
    Doctor.countDocuments.mockResolvedValueOnce(0);
    await doctorController.getDoctors({ query: {} }, res, next);
    expect(responseUtils.sendPaginated).toHaveBeenCalled();

    Doctor.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue(null),
    });
    await doctorController.getDoctorById({ params: { id: 'd1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    User.findById.mockResolvedValueOnce(null);
    await doctorController.createDoctor({ body: { userId: 'u1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    User.findById.mockResolvedValueOnce({ _id: 'u1', rol: 'medico' });
    Doctor.findOne.mockResolvedValueOnce({ _id: 'dup' });
    await doctorController.createDoctor({ body: { userId: 'u1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(400);

    Doctor.findById.mockResolvedValueOnce(null);
    await doctorController.updateDoctor({ params: { id: 'd1' }, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    Doctor.findById.mockResolvedValueOnce(null);
    await doctorController.deleteDoctor({ params: { id: 'd1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('doctor controller cubre ramas de exito y propagacion de errores', async () => {
    const res = createRes();
    const next = jest.fn();

    Doctor.findById.mockReturnValueOnce({
      populate: jest.fn().mockResolvedValue({ _id: 'd1', userId: { nombre: 'Doc' } }),
    });
    await doctorController.getDoctorById({ params: { id: 'd1' } }, res, next);
    expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, expect.objectContaining({ _id: 'd1', userId: { nombre: 'Doc' } }));

    User.findById.mockResolvedValueOnce({ _id: 'u1', rol: 'medico' });
    Doctor.findOne.mockResolvedValueOnce(null);
    Doctor.create.mockResolvedValueOnce({ _id: 'new-doctor' });
    await doctorController.createDoctor({
      body: { userId: 'u1', especialidad: 'Cardiologia', registroMedico: 'RM1', disponibilidad: [] },
    }, res, next);
    expect(responseUtils.sendCreated).toHaveBeenCalledWith(res, expect.objectContaining({ _id: 'new-doctor' }));

    Doctor.findById.mockResolvedValueOnce({ _id: 'd1' });
    Doctor.findByIdAndUpdate.mockResolvedValueOnce({ _id: 'd1', especialidad: 'Pediatria' });
    await doctorController.updateDoctor({
      params: { id: 'd1' },
      body: { especialidad: 'Pediatria', registroMedico: 'RM2', disponibilidad: [] },
    }, res, next);
    expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, expect.objectContaining({ _id: 'd1', especialidad: 'Pediatria' }));

    Doctor.findById.mockResolvedValueOnce({ _id: 'd1' });
    await doctorController.deleteDoctor({ params: { id: 'd1' } }, res, next);
    expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, null, 'Médico eliminado correctamente');

    Doctor.find.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    await doctorController.getDoctors({ query: {} }, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('user and report controllers cubren ramas principales', async () => {
    const res = createRes();
    const next = jest.fn();

    User.find.mockReturnValueOnce({
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
    User.countDocuments.mockResolvedValueOnce(0);
    Doctor.find.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue([]),
    });
    await userController.getUsers({ query: {} }, res, next);
    expect(responseUtils.sendPaginated).toHaveBeenCalled();

    User.findById.mockResolvedValueOnce(null);
    await userController.getUserById({ params: { id: 'u1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    User.findByIdAndUpdate.mockResolvedValueOnce(null);
    await userController.updateUser({ params: { id: 'u1' }, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    User.findByIdAndDelete.mockResolvedValueOnce(null);
    await userController.deleteUser({ params: { id: 'u1' } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    Appointment.aggregate.mockResolvedValueOnce([{ _id: 'd1', totalCitas: 3 }]);
    await reportController.getOcupacion({}, res, next);
    expect(responseUtils.sendSuccess).toHaveBeenCalled();

    Appointment.aggregate.mockResolvedValueOnce([{ _id: 'General', total: 4 }]);
    await reportController.getByEspecialidad({}, res, next);
    expect(responseUtils.sendSuccess).toHaveBeenCalled();

    Appointment.find.mockReturnValueOnce({
      populate: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
    });
    Appointment.countDocuments.mockResolvedValueOnce(0);
    await reportController.getByPeriodo({ query: { inicio: '2026-06-01', fin: '2026-06-30', page: '1', limit: '10' } }, res, next);
    expect(responseUtils.sendPaginated).toHaveBeenCalled();
  });

  it('user and report controllers cubren exito y errores adicionales', async () => {
    const res = createRes();
    const next = jest.fn();

    Doctor.find.mockReturnValueOnce({
      select: jest.fn().mockResolvedValue([]),
    });
    User.findById.mockResolvedValueOnce({ _id: 'u1' });
    await userController.getUserById({ params: { id: 'u1' } }, res, next);
    expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, expect.objectContaining({ _id: 'u1' }));

    User.findByIdAndUpdate.mockResolvedValueOnce({ _id: 'u1', nombre: 'Editado' });
    await userController.updateUser({ params: { id: 'u1' }, body: { nombre: 'Editado' } }, res, next);
    expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, expect.objectContaining({ nombre: 'Editado' }));

    User.findByIdAndDelete.mockResolvedValueOnce({ _id: 'u1' });
    await userController.deleteUser({ params: { id: 'u1' } }, res, next);
    expect(responseUtils.sendSuccess).toHaveBeenCalledWith(res, null, 'Usuario eliminado correctamente');

    Appointment.aggregate.mockRejectedValueOnce(new Error('report error'));
    await reportController.getOcupacion({}, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));

    Appointment.aggregate.mockRejectedValueOnce(new Error('especialidad error'));
    await reportController.getByEspecialidad({}, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));

    Appointment.find.mockImplementationOnce(() => {
      throw new Error('periodo error');
    });
    await reportController.getByPeriodo({
      query: { inicio: '2026-06-01', fin: '2026-06-30', page: '1', limit: '10' },
    }, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
