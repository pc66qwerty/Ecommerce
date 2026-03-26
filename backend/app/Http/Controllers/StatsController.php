<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StatsController extends Controller
{
    public function index()
    {
        $totalOrders = Order::count();
        $totalRevenue = Order::sum('total_amount');
        $weekOrders = Order::where('created_at', '>=', now()->startOfWeek())->count();
        $weekRevenue = Order::where('created_at', '>=', now()->startOfWeek())->sum('total_amount');
        $totalProducts = Product::count();
        $lowStockProducts = Product::where('stock', '<', 5)->count();
        $totalUsers = User::count();
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->orderByDesc('count')
            ->limit(6)
            ->get();

        return response()->json([
            'total_orders' => $totalOrders,
            'total_revenue' => round($totalRevenue, 2),
            'week_orders' => $weekOrders,
            'week_revenue' => round($weekRevenue, 2),
            'total_products' => $totalProducts,
            'low_stock_products' => $lowStockProducts,
            'total_users' => $totalUsers,
            'orders_by_status' => $ordersByStatus,
        ]);
    }
}
