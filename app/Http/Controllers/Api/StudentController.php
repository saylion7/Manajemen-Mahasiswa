<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\StudentException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreStudentRequest;
use App\Services\StudentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentController extends Controller
{
    private StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['major', 'faculty', 'status', 'semester', 'nim']);
            $students = $this->studentService->getAll($filters);

            return response()->json([
                'success' => true,
                'message' => 'Data mahasiswa berhasil diambil',
                'data' => $students,
                'total' => $students->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('StudentController@index: '.$e->getMessage(), [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    public function show(int $id): JsonResponse
    {
        try {
            $student = $this->studentService->findById($id);

            return response()->json([
                'success' => true,
                'message' => 'Data mahasiswa ditemukan',
                'data' => $student,
            ]);
        } catch (StudentException $e) {
            return $e->render();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan: '.$e->getMessage(),
            ], 500);
        }
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        try {
            $student = $this->studentService->create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Data mahasiswa berhasil ditambahkan',
                'data' => $student,
            ], 201);
        } catch (StudentException $e) {
            return $e->render();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambah data: '.$e->getMessage(),
            ], 500);
        }
    }

    public function update(StoreStudentRequest $request, int $id): JsonResponse
    {
        try {
            $student = $this->studentService->update($id, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Data mahasiswa berhasil diupdate',
                'data' => $student,
            ]);
        } catch (StudentException $e) {
            return $e->render();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate data: '.$e->getMessage(),
            ], 500);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->studentService->delete($id);

            return response()->json([
                'success' => true,
                'message' => 'Data mahasiswa berhasil dihapus',
            ]);
        } catch (StudentException $e) {
            return $e->render();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus data: '.$e->getMessage(),
            ], 500);
        }
    }

    public function search(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'keyword' => 'required|string|min:1',
                'method' => 'nullable|in:linear,binary,sequential',
                'field' => 'nullable|string|in:name,nim,email,major',
            ]);

            $keyword = $request->input('keyword');
            $method = $request->input('method', 'linear');
            $field = $request->input('field', 'name');

            $startTime = microtime(true);
            $results = $this->studentService->search($keyword, $method, $field);
            $executionTime = (microtime(true) - $startTime) * 1000;

            return response()->json([
                'success' => true,
                'message' => 'Hasil pencarian',
                'data' => $results,
                'total' => $results->count(),
                'meta' => [
                    'keyword' => $keyword,
                    'method' => $method,
                    'field' => $field,
                    'execution_time_ms' => round($executionTime, 4),
                    'time_complexity' => $this->getSearchTimeComplexity($method),
                ],
            ]);
        } catch (StudentException $e) {
            return $e->render();
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Pencarian gagal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function sort(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'algorithm' => 'required|in:insertion,selection,bubble,merge,shell',
                'field' => 'nullable|string|in:name,nim,email,gpa,semester,major',
                'order' => 'nullable|in:asc,desc',
            ]);

            $algorithm = $request->input('algorithm');
            $field = $request->input('field', 'name');
            $order = $request->input('order', 'asc');

            $startTime = microtime(true);
            $results = $this->studentService->sort($algorithm, $field, $order);
            $executionTime = (microtime(true) - $startTime) * 1000;

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diurutkan',
                'data' => $results,
                'total' => $results->count(),
                'meta' => [
                    'algorithm' => $algorithm,
                    'field' => $field,
                    'order' => $order,
                    'execution_time_ms' => round($executionTime, 4),
                    'time_complexity' => $this->getSortTimeComplexity($algorithm),
                ],
            ]);
        } catch (StudentException $e) {
            return $e->render();
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Pengurutan gagal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function export(Request $request): StreamedResponse|JsonResponse
    {
        try {
            $filename = 'students_'.now()->format('Ymd_His').'.csv';
            $csvContent = $this->studentService->generateCsvContent();

            return response()->streamDownload(function () use ($csvContent) {
                echo "\xEF\xBB\xBF".$csvContent;
            }, $filename, [
                'Content-Type' => 'text/csv; charset=utf-8',
                'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            ]);
        } catch (StudentException $e) {
            return $e->render();
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Ekspor gagal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function import(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'filename' => 'required|string',
            ]);

            $count = $this->studentService->importCsv($request->input('filename'));

            return response()->json([
                'success' => true,
                'message' => "Berhasil mengimpor {$count} data mahasiswa",
                'data' => ['imported' => $count],
            ]);
        } catch (StudentException $e) {
            return $e->render();
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Import gagal: '.$e->getMessage(),
            ], 500);
        }
    }

    public function filters(): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => [
                    'faculties' => $this->studentService->getFaculties(),
                    'majors' => $this->studentService->getMajors(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data filter: '.$e->getMessage(),
            ], 500);
        }
    }

    private function getSearchTimeComplexity(string $method): array
    {
        return match ($method) {
            'linear' => [
                'best' => 'O(1)',
                'average' => 'O(n)',
                'worst' => 'O(n)',
                'description' => 'Linear Search: membandingkan setiap elemen satu per satu',
            ],
            'binary' => [
                'best' => 'O(1)',
                'average' => 'O(log n)',
                'worst' => 'O(log n)',
                'description' => 'Binary Search: membagi data menjadi dua bagian setiap iterasi (data harus terurut)',
            ],
            'sequential' => [
                'best' => 'O(1)',
                'average' => 'O(n)',
                'worst' => 'O(n)',
                'description' => 'Sequential Search: mencari elemen pertama yang cocok secara berurutan',
            ],
        };
    }

    private function getSortTimeComplexity(string $algorithm): array
    {
        return match ($algorithm) {
            'insertion' => [
                'best' => 'O(n)',
                'average' => 'O(n²)',
                'worst' => 'O(n²)',
                'description' => 'Insertion Sort: membangun array terurut dengan menyisipkan elemen satu per satu',
            ],
            'selection' => [
                'best' => 'O(n²)',
                'average' => 'O(n²)',
                'worst' => 'O(n²)',
                'description' => 'Selection Sort: memilih elemen terkecil dan menukar dengan posisi yang sesuai',
            ],
            'bubble' => [
                'best' => 'O(n)',
                'average' => 'O(n²)',
                'worst' => 'O(n²)',
                'description' => 'Bubble Sort: membandingkan dan menukar elemen bertetangga',
            ],
            'merge' => [
                'best' => 'O(n log n)',
                'average' => 'O(n log n)',
                'worst' => 'O(n log n)',
                'description' => 'Merge Sort: membagi array menjadi dua bagian, mengurutkan, lalu menggabungkan',
            ],
            'shell' => [
                'best' => 'O(n log n)',
                'average' => 'O(n(log n)²)',
                'worst' => 'O(n(log n)²)',
                'description' => 'Shell Sort: varian Insertion Sort dengan perbandingan elemen berjarak',
            ],
        };
    }
}
