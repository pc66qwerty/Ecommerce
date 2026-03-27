<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id', 'reference_number', 'total_amount', 'status', 'payment_proof_status', 'tracking_number', 'shipping_company', 'shipping_info'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function statuses()
    {
        return $this->hasMany(OrderStatus::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
