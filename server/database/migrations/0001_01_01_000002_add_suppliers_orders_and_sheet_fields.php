<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->foreignId('supplier_id')->nullable()->after('category_id')->constrained()->nullOnDelete();
            $table->enum('approval_status', ['APPROVED', 'REJECTED', 'REORDERED'])->default('APPROVED')->after('status');
            $table->string('po_id')->nullable()->after('approval_status');
            $table->unsignedInteger('reorder_qty')->nullable()->after('po_id');
            $table->string('urgency')->nullable()->after('reorder_qty');
            $table->text('note')->nullable()->after('urgency');
        });

        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_id')->unique();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->nullable()->constrained()->nullOnDelete();
            $table->string('item_name');
            $table->unsignedInteger('ordered_qty');
            $table->unsignedInteger('remaining_stock');
            $table->string('status');
            $table->timestamp('order_date');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropColumn(['approval_status', 'po_id', 'reorder_qty', 'urgency', 'note']);
        });

        Schema::dropIfExists('suppliers');
    }
};
