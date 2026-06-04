<?php

namespace App\Services;

use App\Models\Student;
use Illuminate\Support\Collection;

class SearchService
{
    public function linearSearch(Collection $students, string $keyword, string $field = 'name'): Collection
    {
        $results = collect();

        foreach ($students as $student) {
            if (stripos($student->$field, $keyword) !== false) {
                $results->push($student);
            }
        }

        return $results;
    }

    public function binarySearch(Collection $students, string $keyword, string $field = 'nim'): ?Student
    {
        $sorted = $students->sortBy($field)->values();
        $low = 0;
        $high = $sorted->count() - 1;

        while ($low <= $high) {
            $mid = (int) floor(($low + $high) / 2);
            $student = $sorted->get($mid);
            $comparison = strcasecmp($student->$field, $keyword);

            if ($comparison === 0) {
                return $student;
            }

            if ($comparison < 0) {
                $low = $mid + 1;
            } else {
                $high = $mid - 1;
            }
        }

        return null;
    }

    public function sequentialSearch(Collection $students, string $keyword, string $field = 'nim'): ?Student
    {
        foreach ($students as $student) {
            if (strcasecmp($student->$field, $keyword) === 0) {
                return $student;
            }
        }

        return null;
    }
}
