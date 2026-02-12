export interface Alert {
    id: number;
    timestamp: Date;
    patientId: number;
    patientName: string;
    patientPhoto?: string;
    type: AlertType;
    zoneId?: number;
    zoneName?: string;
    status: AlertStatus;
    actionsTaken: AlertAction[];
    notes?: string;
    position?: { lat: number; lng: number };
    resolvedAt?: Date;
    resolvedBy?: string;
}

export type AlertType = 'zone_exit' | 'forbidden_entry' | 'gps_loss' | 'low_battery';

export type AlertStatus = 'new' | 'in_progress' | 'resolved' | 'ignored';

export type AlertAction = 'sms' | 'email' | 'push';

export interface AlertStatistics {
    totalAlerts: number;
    resolvedAlerts: number;
    activeAlerts: number;
    alertsByType: { [key in AlertType]: number };
    alertsByDay: { date: string; count: number }[];
}
