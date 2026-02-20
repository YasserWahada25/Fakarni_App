export interface AlertSettings {
    id: number;
    // SMS Settings
    smsEnabled: boolean;
    smsContacts: string[];
    smsTemplate: string;

    // Email Settings
    emailEnabled: boolean;
    emailContacts: string[];
    emailTemplate: string;
    emailSubject: string;

    // Push Notification Settings
    pushEnabled: boolean;

    // Alert Thresholds
    alertDelayMinutes: number;
    gpsLossAttempts: number;
    batteryLowThreshold: number;

    // Auto-resolve settings
    autoResolveEnabled: boolean;
    autoResolveMinutes: number;
}

export const DEFAULT_ALERT_SETTINGS: AlertSettings = {
    id: 1,
    smsEnabled: true,
    smsContacts: [],
    smsTemplate: 'ALERTE: {patient} a quitté la zone {zone} à {heure}. Position actuelle: {position}',
    emailEnabled: true,
    emailContacts: [],
    emailTemplate: 'Bonjour,\n\nNous vous informons que {patient} a déclenché une alerte de type {type}.\n\nZone concernée: {zone}\nHeure: {heure}\nPosition: {position}\n\nCordialement,\nFakarni',
    emailSubject: 'Alerte Géolocalisation - {patient}',
    pushEnabled: true,
    alertDelayMinutes: 5,
    gpsLossAttempts: 3,
    batteryLowThreshold: 20,
    autoResolveEnabled: false,
    autoResolveMinutes: 60
};
