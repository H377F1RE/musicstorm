<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('login', 32)->unique();
            $table->string('email', 64)->unique();
            $table->string('password');
            $table->string('theme')->default('light');
            $table->enum('role', ['user', 'admin'])->default('user');
            $table->timestamp('last_login_at')->nullable();
            $table->boolean('is_blocked')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('users');
    }
};
