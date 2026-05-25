<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebhookDelivery;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookDeliveryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WebhookDelivery::query()->with('subscription')->latest();

        if ($request->filled('direction')) {
            $query->where('direction', $request->string('direction'));
        }

        return response()->json($query->paginate(20));
    }
}
