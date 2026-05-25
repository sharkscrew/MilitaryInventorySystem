<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebhookSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WebhookSubscriptionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(WebhookSubscription::query()->latest()->get());
    }

    public function events(): JsonResponse
    {
        return response()->json([
            'events' => WebhookSubscription::EVENTS,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'target_url' => ['required', 'url', 'max:500'],
            'secret' => ['nullable', 'string', 'min:16', 'max:64'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['string', Rule::in(WebhookSubscription::EVENTS)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $subscription = WebhookSubscription::create($validated);

        return response()->json($subscription, 201);
    }

    public function update(Request $request, WebhookSubscription $webhookSubscription): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'target_url' => ['sometimes', 'url', 'max:500'],
            'secret' => ['sometimes', 'string', 'min:16', 'max:64'],
            'events' => ['sometimes', 'array', 'min:1'],
            'events.*' => ['string', Rule::in(WebhookSubscription::EVENTS)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $webhookSubscription->update($validated);

        return response()->json($webhookSubscription);
    }

    public function destroy(WebhookSubscription $webhookSubscription): JsonResponse
    {
        $webhookSubscription->delete();

        return response()->json(['message' => 'Webhook subscription removed.']);
    }
}
