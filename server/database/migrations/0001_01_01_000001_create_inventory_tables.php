<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->string('item_code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('unit', 50)->default('pcs');
            $table->unsignedInteger('quantity')->default(0);
            $table->unsignedInteger('reorder_level')->default(10);
            $table->string('location')->nullable();
            $table->enum('status', ['available', 'low_stock', 'out_of_stock'])->default('available');
            $table->timestamps();
        });

        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['receive', 'issue', 'return', 'adjustment']);
            $table->unsignedInteger('quantity');
            $table->string('personnel_name');
            $table->string('reference_no', 100)->nullable();
            $table->text('remarks')->nullable();
            $table->unsignedInteger('balance_after');
            $table->timestamps();
        });

        Schema::create('webhook_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('target_url');
            $table->string('secret');
            $table->json('events');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('webhook_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('webhook_subscription_id')->nullable()->constrained()->nullOnDelete();
            $table->string('event');
            $table->enum('direction', ['incoming', 'outgoing']);
            $table->json('payload');
            $table->unsignedSmallInteger('response_status')->nullable();
            $table->text('response_body')->nullable();
            $table->boolean('success')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_deliveries');
        Schema::dropIfExists('webhook_subscriptions');
        Schema::dropIfExists('stock_transactions');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('categories');
    }
};
