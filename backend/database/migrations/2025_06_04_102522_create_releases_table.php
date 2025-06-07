<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('releases', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('release_group_id');
            $table->foreign('release_group_id')->references('id')->on('release_groups')->onDelete('cascade');
            $table->unsignedBigInteger('label_id')->nullable();
            $table->foreign('label_id')->references('id')->on('labels')->onDelete('set null');
            $table->string('title', 128);
            $table->string('cover')->nullable();
            $table->date('release_date')->nullable();
            $table->string('country', 2)->nullable();
            $table->string('catalog_number', 64)->nullable();
            $table->string('barcode', 32)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('releases');
    }
};