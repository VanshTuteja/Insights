import mongoose from 'mongoose';

export interface INotification extends mongoose.Document {
    userId: mongoose.Schema.Types.ObjectId;
    type: 'job-match' | 'interview-scheduled' | 'profile-viewed' | 'application-update' | 'job-posted';
    jobId?: mongoose.Schema.Types.ObjectId;
    title: string;
    description: string;
    read: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new mongoose.Schema<INotification>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        type: {
            type: String,
            enum: ['job-match', 'interview-scheduled', 'profile-viewed', 'application-update', 'job-posted'],
            required: true,
        },
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
