<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Coupon extends Model {
    protected $fillable = ['user_id', 'code', 'description', 'discount_type', 'discount_value', 'min_purchase', 'max_uses', 'uses_count', 'expires_at', 'is_active'];
    protected $casts = ['expires_at' => 'datetime', 'is_active' => 'boolean'];

    public function getDiscountAmount(float $total): float {
        if ($this->discount_type === 'percentage') {
            return round($total * ($this->discount_value / 100), 2);
        }
        return min((float)$this->discount_value, $total);
    }
}
