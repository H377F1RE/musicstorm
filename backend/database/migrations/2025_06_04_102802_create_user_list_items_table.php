<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('user_list_items', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('user_list_id');
            $table->foreign('user_list_id')->references('id')->on('user_lists')->onDelete('cascade');
            $table->unsignedBigInteger('release_id');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('user_list_items');
    }
};