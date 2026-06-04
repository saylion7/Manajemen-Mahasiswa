<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->string('nim', 20)->unique();
            $table->string('name', 100);
            $table->string('email', 100)->unique();
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('major', 100);
            $table->string('faculty', 100);
            $table->decimal('gpa', 3, 2)->default(0);
            $table->unsignedTinyInteger('semester')->default(1);
            $table->enum('status', ['active', 'graduated', 'dropped_out'])->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
