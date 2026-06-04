<?php

namespace App\Notifications;

use App\Models\Student;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StudentDeleted extends Notification
{
    use Queueable;

    public function __construct(public Student $student) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'student_deleted',
            'student_id' => $this->student->id,
            'student_nim' => $this->student->nim,
            'student_name' => $this->student->name,
            'message' => "Mahasiswa {$this->student->name} ({$this->student->nim}) telah dihapus",
        ];
    }
}
