<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Clean up expired product discounts every hour
Schedule::call(function () {
    \App\Models\Product::whereNotNull('offer_ends_at')
        ->where('offer_ends_at', '<=', now())
        ->update(['discount_price' => null, 'offer_ends_at' => null]);
})->hourly()->name('expire-discounts')->withoutOverlapping();
