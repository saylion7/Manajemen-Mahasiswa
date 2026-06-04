<?php

namespace App\Services;

use App\Exceptions\StudentException;
use App\Models\Student;
use App\Notifications\StudentCreated;
use App\Notifications\StudentDeleted;
use App\Notifications\StudentUpdated;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class StudentService
{
    private SearchService $searchService;

    private SortService $sortService;

    private FileStorageService $fileStorageService;

    public function __construct(
        SearchService $searchService,
        SortService $sortService,
        FileStorageService $fileStorageService
    ) {
        $this->searchService = $searchService;
        $this->sortService = $sortService;
        $this->fileStorageService = $fileStorageService;
    }

    public function getAll(array $filters = []): Collection
    {
        try {
            $query = Student::query();

            if (! empty($filters['major'])) {
                $query->where('major', $filters['major']);
            }

            if (! empty($filters['faculty'])) {
                $query->where('faculty', $filters['faculty']);
            }

            if (! empty($filters['status'])) {
                $query->where('status', $filters['status']);
            }

            if (! empty($filters['semester'])) {
                $query->where('semester', $filters['semester']);
            }

            if (! empty($filters['nim'])) {
                $query->where('nim', $filters['nim']);
            }

            return $query->get();
        } catch (\Exception $e) {
            throw new StudentException('Gagal mengambil data mahasiswa: '.$e->getMessage(), 500);
        }
    }

    public function findById(int $id): Student
    {
        try {
            $student = Student::find($id);

            if (! $student) {
                throw new StudentException('Data mahasiswa tidak ditemukan', 404);
            }

            return $student;
        } catch (StudentException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new StudentException('Gagal mencari mahasiswa: '.$e->getMessage(), 500);
        }
    }

    public function create(array $data): Student
    {
        try {
            $this->validateNim($data['nim']);

            $student = Student::create($data);

            Auth::user()->notify(new StudentCreated($student));

            return $student;
        } catch (StudentException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new StudentException('Gagal menambah mahasiswa: '.$e->getMessage(), 500);
        }
    }

    public function update(int $id, array $data): Student
    {
        try {
            $student = $this->findById($id);

            if (isset($data['nim']) && $data['nim'] !== $student->nim) {
                $this->validateNim($data['nim']);
            }

            $student->update($data);

            $fresh = $student->fresh();

            Auth::user()->notify(new StudentUpdated($fresh));

            return $fresh;
        } catch (StudentException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new StudentException('Gagal mengupdate mahasiswa: '.$e->getMessage(), 500);
        }
    }

    public function delete(int $id): bool
    {
        try {
            $student = $this->findById($id);

            Auth::user()->notify(new StudentDeleted($student));

            return $student->delete();
        } catch (StudentException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new StudentException('Gagal menghapus mahasiswa: '.$e->getMessage(), 500);
        }
    }

    public function search(string $keyword, string $method = 'linear', string $field = 'name'): Collection
    {
        try {
            if (empty(trim($keyword))) {
                throw new StudentException('Kata kunci pencarian tidak boleh kosong', 400);
            }

            $students = Student::all();

            if ($students->isEmpty()) {
                return collect();
            }

            return match ($method) {
                'binary' => $this->searchWithBinary($students, $keyword, $field),
                'sequential' => $this->searchWithSequential($students, $keyword, $field),
                'linear' => $this->searchWithLinear($students, $keyword, $field),
                default => throw new StudentException('Metode pencarian tidak valid', 400),
            };
        } catch (StudentException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new StudentException('Gagal melakukan pencarian: '.$e->getMessage(), 500);
        }
    }

    private function searchWithLinear(Collection $students, string $keyword, string $field): Collection
    {
        return $this->searchService->linearSearch($students, $keyword, $field);
    }

    private function searchWithBinary(Collection $students, string $keyword, string $field): Collection
    {
        if ($field === 'nim') {
            $result = $this->searchService->binarySearch($students, $keyword, 'nim');

            return $result ? collect([$result]) : collect();
        }

        $sorted = $this->sortService->insertionSort($students, $field);
        $result = $this->searchService->binarySearch($sorted, $keyword, $field);

        return $result ? collect([$result]) : collect();
    }

    private function searchWithSequential(Collection $students, string $keyword, string $field): Collection
    {
        if ($field === 'nim') {
            $result = $this->searchService->sequentialSearch($students, $keyword, 'nim');

            return $result ? collect([$result]) : collect();
        }

        $result = $this->searchService->sequentialSearch($students, $keyword, $field);

        return $result ? collect([$result]) : collect();
    }

    public function sort(string $algorithm, string $field = 'name', string $order = 'asc'): Collection
    {
        try {
            $students = Student::all();

            if ($students->isEmpty()) {
                return collect();
            }

            return match ($algorithm) {
                'insertion' => $this->sortService->insertionSort($students, $field, $order),
                'selection' => $this->sortService->selectionSort($students, $field, $order),
                'bubble' => $this->sortService->bubbleSort($students, $field, $order),
                'merge' => $this->sortService->mergeSort($students, $field, $order),
                'shell' => $this->sortService->shellSort($students, $field, $order),
                default => throw new StudentException('Algoritma pengurutan tidak valid', 400),
            };
        } catch (StudentException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new StudentException('Gagal melakukan pengurutan: '.$e->getMessage(), 500);
        }
    }

    public function generateCsvContent(): string
    {
        $students = Student::all();

        if ($students->isEmpty()) {
            throw new StudentException('Tidak ada data mahasiswa untuk diekspor', 404);
        }

        return $this->fileStorageService->buildCsvString($students);
    }

    public function importCsv(string $filename): int
    {
        try {
            $students = $this->fileStorageService->importFromCsv($filename);
            $imported = 0;

            foreach ($students as $student) {
                try {
                    $existingNim = Student::where('nim', $student->nim)->first();
                    $existingEmail = Student::where('email', $student->email)->first();

                    if ($existingNim || $existingEmail) {
                        continue;
                    }

                    $student->save();
                    $imported++;
                } catch (\Exception $e) {
                    continue;
                }
            }

            return $imported;
        } catch (StudentException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new StudentException('Gagal mengimpor data: '.$e->getMessage(), 500);
        }
    }

    public function getFaculties(): array
    {
        return Student::select('faculty')->distinct()->pluck('faculty')->toArray();
    }

    public function getMajors(): array
    {
        return Student::select('major')->distinct()->pluck('major')->toArray();
    }

    private function validateNim(string $nim): void
    {
        $pattern = '/^\d{12}$/';

        if (! preg_match($pattern, $nim)) {
            throw new StudentException('Format NIM harus 12 digit angka (contoh: 241011450628)', 400);
        }
    }
}
