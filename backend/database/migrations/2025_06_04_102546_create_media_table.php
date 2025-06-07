<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('media', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('release_id');
            $table->foreign('release_id')->references('id') ->on('releases')->onDelete('cascade');
            $table->enum('format', ['CD', 'vinyl', 'cassette', 'digital']);
            $table->integer('position')->nullable();
            $table->string('title')->nullable();
            $table->integer('track_count')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('media');
    }
};