<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail as BaseVerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;

class CustomVerifyEmail extends BaseVerifyEmail
{
    use Queueable;

    protected function verificationUrl($notifiable)
    {
        return URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
    }

    public function toMail($notifiable)
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return (new MailMessage)
            ->subject('Verifikasi Email - '.config('app.name'))
            ->greeting('Halo '.$notifiable->name.'!')
            ->line('Terima kasih telah mendaftar di '.config('app.name').'.')
            ->line('Silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:')
            ->action('Verifikasi Email', $verificationUrl)
            ->line('Jika Anda tidak mendaftar akun ini, abaikan email ini.')
            ->line('Link verifikasi ini berlaku selama 60 menit.')
            ->salutation('Salam, '.config('app.name').' | '.config('app.url'));
    }
}
