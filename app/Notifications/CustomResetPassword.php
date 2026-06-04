<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword as BaseResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class CustomResetPassword extends BaseResetPassword
{
    public function toMail($notifiable)
    {
        $resetUrl = url(config('app.url').'/reset-password?token='.$this->token.'&email='.$notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Reset Password - '.config('app.name'))
            ->greeting('Halo '.$notifiable->name.'!')
            ->line('Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.')
            ->action('Reset Password', $resetUrl)
            ->line('Link reset password ini akan kadaluarsa dalam 60 menit.')
            ->line('Jika Anda tidak meminta reset password, abaikan email ini.')
            ->salutation('Salam, '.config('app.name').' | '.config('app.url'));
    }
}
