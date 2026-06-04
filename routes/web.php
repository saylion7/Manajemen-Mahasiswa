<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/email/verify/{id}/{hash}', function (Request $request) {
    $user = User::findOrFail($request->route('id'));

    if (! hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
        abort(403, 'Link verifikasi tidak valid');
    }

    if ($user->hasVerifiedEmail()) {
        return redirect('/login?verified=1');
    }

    if ($user->markEmailAsVerified()) {
        event(new Verified($user));
    }

    return redirect('/login?verified=1');
})->name('verification.verify');

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
