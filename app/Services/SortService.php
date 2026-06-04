<?php

namespace App\Services;

use Illuminate\Support\Collection;

class SortService
{
    public function insertionSort(Collection $students, string $field = 'name', string $order = 'asc'): Collection
    {
        $array = $students->values()->toArray();
        $n = count($array);

        for ($i = 1; $i < $n; $i++) {
            $key = $array[$i];
            $j = $i - 1;

            while ($j >= 0 && $this->compare($array[$j], $key, $field, $order) > 0) {
                $array[$j + 1] = $array[$j];
                $j--;
            }
            $array[$j + 1] = $key;
        }

        return collect($array);
    }

    public function selectionSort(Collection $students, string $field = 'name', string $order = 'asc'): Collection
    {
        $array = $students->values()->toArray();
        $n = count($array);

        for ($i = 0; $i < $n - 1; $i++) {
            $target = $i;

            for ($j = $i + 1; $j < $n; $j++) {
                if ($this->compare($array[$j], $array[$target], $field, $order) < 0) {
                    $target = $j;
                }
            }

            if ($target !== $i) {
                $temp = $array[$i];
                $array[$i] = $array[$target];
                $array[$target] = $temp;
            }
        }

        return collect($array);
    }

    public function bubbleSort(Collection $students, string $field = 'name', string $order = 'asc'): Collection
    {
        $array = $students->values()->toArray();
        $n = count($array);

        for ($i = 0; $i < $n - 1; $i++) {
            $swapped = false;

            for ($j = 0; $j < $n - $i - 1; $j++) {
                if ($this->compare($array[$j], $array[$j + 1], $field, $order) > 0) {
                    $temp = $array[$j];
                    $array[$j] = $array[$j + 1];
                    $array[$j + 1] = $temp;
                    $swapped = true;
                }
            }

            if (! $swapped) {
                break;
            }
        }

        return collect($array);
    }

    public function mergeSort(Collection $students, string $field = 'name', string $order = 'asc'): Collection
    {
        $array = $students->values()->toArray();
        $sorted = $this->doMergeSort($array, $field, $order);

        return collect($sorted);
    }

    private function doMergeSort(array $array, string $field, string $order): array
    {
        $n = count($array);

        if ($n <= 1) {
            return $array;
        }

        $mid = (int) floor($n / 2);
        $left = array_slice($array, 0, $mid);
        $right = array_slice($array, $mid);

        $left = $this->doMergeSort($left, $field, $order);
        $right = $this->doMergeSort($right, $field, $order);

        return $this->merge($left, $right, $field, $order);
    }

    private function merge(array $left, array $right, string $field, string $order): array
    {
        $result = [];
        $i = 0;
        $j = 0;

        while ($i < count($left) && $j < count($right)) {
            if ($this->compare($left[$i], $right[$j], $field, $order) <= 0) {
                $result[] = $left[$i];
                $i++;
            } else {
                $result[] = $right[$j];
                $j++;
            }
        }

        while ($i < count($left)) {
            $result[] = $left[$i];
            $i++;
        }

        while ($j < count($right)) {
            $result[] = $right[$j];
            $j++;
        }

        return $result;
    }

    public function shellSort(Collection $students, string $field = 'name', string $order = 'asc'): Collection
    {
        $array = $students->values()->toArray();
        $n = count($array);

        for ($gap = (int) floor($n / 2); $gap > 0; $gap = (int) floor($gap / 2)) {
            for ($i = $gap; $i < $n; $i++) {
                $temp = $array[$i];
                $j = $i;

                while ($j >= $gap && $this->compare($array[$j - $gap], $temp, $field, $order) > 0) {
                    $array[$j] = $array[$j - $gap];
                    $j -= $gap;
                }

                $array[$j] = $temp;
            }
        }

        return collect($array);
    }

    private function compare($a, $b, string $field, string $order): int
    {
        $valA = is_object($a) ? $a->$field : $a[$field];
        $valB = is_object($b) ? $b->$field : $b[$field];

        if (is_numeric($valA) && is_numeric($valB)) {
            $result = $valA <=> $valB;
        } else {
            $result = strcasecmp((string) $valA, (string) $valB);
        }

        return $order === 'desc' ? -$result : $result;
    }
}
