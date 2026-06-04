<?php

namespace App\Services;

use App\Exceptions\StudentException;
use App\Models\Student;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;

class FileStorageService
{
    private string $disk;

    private string $directory;

    public function __construct(string $disk = 'local', string $directory = 'students')
    {
        $this->disk = $disk;
        $this->directory = $directory;
    }

    public function buildCsvString(Collection $students): string
    {
        $csv = "NIM,Nama,Email,Telepon,Alamat,Jurusan,Fakultas,IPK,Semester,Status\n";

        foreach ($students as $student) {
            $csv .= implode(',', [
                $student->nim,
                '"'.str_replace('"', '""', $student->name).'"',
                $student->email,
                $student->phone,
                '"'.str_replace('"', '""', $student->address ?? '').'"',
                $student->major,
                $student->faculty,
                $student->gpa,
                $student->semester,
                $student->status,
            ])."\n";
        }

        return $csv;
    }

    public function importFromCsv(string $filename): Collection
    {
        try {
            $path = $this->directory.'/'.$filename;

            if (! Storage::disk($this->disk)->exists($path)) {
                throw new StudentException('File tidak ditemukan: '.$filename, 404);
            }

            $content = Storage::disk($this->disk)->get($path);
            $lines = explode("\n", trim($content));
            $header = str_getcsv(array_shift($lines));

            $students = collect();

            foreach ($lines as $line) {
                if (empty(trim($line))) {
                    continue;
                }

                $data = str_getcsv($line);
                $row = array_combine($header, $data);

                $students->push(new Student([
                    'nim' => $row['NIM'],
                    'name' => $row['Nama'],
                    'email' => $row['Email'],
                    'phone' => $row['Telepon'] ?? null,
                    'address' => $row['Alamat'] ?? null,
                    'major' => $row['Jurusan'],
                    'faculty' => $row['Fakultas'],
                    'gpa' => $row['IPK'],
                    'semester' => $row['Semester'],
                    'status' => $row['Status'] ?? 'active',
                ]));
            }

            return $students;
        } catch (StudentException $e) {
            throw $e;
        } catch (\Exception $e) {
            throw new StudentException('Gagal mengimpor data dari CSV: '.$e->getMessage(), 500);
        }
    }
}
