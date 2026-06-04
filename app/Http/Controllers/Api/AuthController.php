<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:100|regex:/^[\pL\s\.\'-]+$/u',
                'email' => 'required|email|max:100|unique:users,email',
                'password' => 'required|string|min:8|max:50|confirmed',
            ]);

            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);

            event(new Registered($user));

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil. Silakan verifikasi email Anda.',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registrasi gagal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function login(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email',
                'password' => 'required|string',
            ]);

            if (! Auth::attempt($validated)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password salah',
                ], 401);
            }

            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login gagal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout gagal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $request->user(),
        ]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'current_password' => 'required|string|current_password',
                'password' => 'required|string|min:8|max:50|confirmed',
            ]);

            $user = $request->user();
            $user->update([
                'password' => Hash::make($validated['password']),
            ]);

            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil diubah. Silakan login ulang.',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah password: '.$e->getMessage(),
            ], 500);
        }
    }

    public function sendVerificationEmail(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email sudah terverifikasi',
                ], 400);
            }

            $user->sendEmailVerificationNotification();

            return response()->json([
                'success' => true,
                'message' => 'Kode verifikasi telah dikirim ulang',
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal kirim email verifikasi: '.$e->getMessage(), [
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email verifikasi: '.$e->getMessage(),
            ], 500);
        }
    }

    public function resendVerificationEmail(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email sudah terverifikasi',
                ], 400);
            }

            $cacheKey = 'verification_code_sent_at_'.$user->id;
            $lastSent = Cache::get($cacheKey);

            if ($lastSent && now()->diffInMinutes($lastSent) < 1) {
                return response()->json([
                    'success' => false,
                    'message' => 'Silakan tunggu 1 menit sebelum mengirim ulang',
                ], 429);
            }

            $user->sendEmailVerificationNotification();
            Cache::put($cacheKey, now(), 60);

            return response()->json([
                'success' => true,
                'message' => 'Kode verifikasi telah dikirim ulang',
            ]);
        } catch (\Exception $e) {
            Log::error('Gagal kirim ulang email: '.$e->getMessage(), [
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim ulang email: '.$e->getMessage(),
            ], 500);
        }
    }

    public function verifyEmail(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Email sudah terverifikasi',
                ]);
            }

            if ($user->markEmailAsVerified()) {
                event(new Verified($user));
            }

            return response()->json([
                'success' => true,
                'message' => 'Email berhasil diverifikasi',
            ]);
        } catch (\Exception $e) {
            Log::error('Verifikasi email gagal: '.$e->getMessage(), [
                'user_id' => $request->user()?->id,
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Verifikasi email gagal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);

            $status = Password::sendResetLink($validated);

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'success' => true,
                    'message' => 'Link reset password telah dikirim ke email Anda',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim link reset password',
            ], 500);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'token' => 'required|string',
                'email' => 'required|email|exists:users,email',
                'password' => 'required|string|min:8|max:50|confirmed',
            ]);

            $status = Password::reset(
                $validated,
                function (User $user, string $password) {
                    $user->forceFill([
                        'password' => Hash::make($password),
                    ])->save();

                    $user->tokens()->delete();

                    event(new PasswordReset($user));
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'success' => true,
                    'message' => 'Password berhasil direset. Silakan login dengan password baru.',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Token reset password tidak valid atau sudah kadaluarsa',
            ], 400);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Reset password gagal: '.$e->getMessage(),
            ], 500);
        }
    }
}
