import { Request, Response, NextFunction } from 'express';
import { BookingsService } from './bookings.service';
import { getWebSocketServer } from '../../websocket/websocket.server';

export class BookingsController {
  private service: BookingsService;

  constructor() {
    this.service = new BookingsService();
  }

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const userId = req.user!.id;
      const booking = await this.service.createBooking(data, userId);
      
      // Emit WebSocket events after successful booking creation
      try {
        const websocketServer = getWebSocketServer();
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        
        // Emit booking created event
        websocketServer.emitBookingCreated(
          booking.roomId,
          booking.userId,
          {
            booking: {
              id: booking.id,
              roomId: booking.roomId,
              date: booking.date,
              startTime: booking.startTime,
              endTime: booking.endTime,
              status: booking.status
            }
          }
        );
        
        // Emit slot booked event
        websocketServer.emitSlotBooked(
          booking.roomId,
          bookingDate,
          {
            isBooked: true,
            booking: booking
          }
        );
      } catch (wsError) {
        console.error('WebSocket emission error:', wsError);
        // Don't fail the request if WebSocket fails
      }
      
      res.status(201).json({ booking });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const booking = await this.service.getBookingById(id, userId, userRole);
      res.json({ booking });
    } catch (error) {
      next(error);
    }
  };

  getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const bookings = await this.service.getUserBookings(userId);
      res.json({ bookings });
    } catch (error) {
      next(error);
    }
  };

  getRoomBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roomId } = req.params;
      const filters = req.query;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const bookings = await this.service.getRoomBookings(roomId, filters, userId, userRole);
      res.json({ bookings });
    } catch (error) {
      next(error);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const booking = await this.service.cancelBooking(id, userId, userRole);
      
      // Emit WebSocket events after successful booking cancellation
      try {
        const websocketServer = getWebSocketServer();
        const bookingDate = new Date(booking.date).toISOString().split('T')[0];
        
        // Emit booking cancelled event
        websocketServer.emitBookingCancelled(
          booking.roomId,
          booking.userId,
          { 
            booking: {
              id: booking.id,
              roomId: booking.roomId,
              date: booking.date
            }
          }
        );
        
        // Emit slot cancelled event
        websocketServer.emitSlotCancelled(
          booking.roomId,
          bookingDate,
          {
            isBooked: false
          }
        );
      } catch (wsError) {
        console.error('WebSocket emission error:', wsError);
        // Don't fail the request if WebSocket fails
      }
      
      res.json({ booking, message: 'Booking cancelled successfully' });
    } catch (error) {
      next(error);
    }
  };
}
