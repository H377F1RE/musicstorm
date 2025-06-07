<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_lists', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->enum('type', ['collection', 'wishlist', 'user'])->default('user');
            $table->string('name', 128)->nullable();
            $table->boolean('public')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('user_lists');
    }
};