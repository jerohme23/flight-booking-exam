export interface BookingDetails {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: {
    checkin: string;
    checkout: string;
  };
  additionalneeds: string;
}

export interface CreateBookingResponse {
  bookingid: number;
  booking: BookingDetails;
}