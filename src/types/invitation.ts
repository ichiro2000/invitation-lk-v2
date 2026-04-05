export interface InvitationEvent {
  title: string;
  time: string;
  venue?: string;
  description?: string;
}

export interface InvitationData {
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  venue: string;
  venueAddress: string;
  events: InvitationEvent[];
}

export const defaultInvitationData: InvitationData = {
  groomName: "",
  brideName: "",
  weddingDate: "",
  weddingTime: "4:00 PM",
  venue: "",
  venueAddress: "",
  events: [
    { title: "Wedding Ceremony", time: "4:00 PM", venue: "" },
    { title: "Reception", time: "7:00 PM", venue: "" },
  ],
};
