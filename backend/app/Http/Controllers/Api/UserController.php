<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Display a listing of users (Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // Only admin can access
            if (!$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.',
                ], 403);
            }

            $query = User::query();

            // Filter by role if provided
            if ($request->has('role')) {
                $query->byRole($request->role);
            }

            // Search functionality
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('name', 'LIKE', "%{$search}%")
                      ->orWhere('email', 'LIKE', "%{$search}%");
                });
            }

            // Pagination
            $perPage = $request->get('per_page', 10);
            $users = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $users->items(),
                'meta' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ], 200);
        } catch (\Exception $e) {
            Log::error('User index error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching users.',
            ], 500);
        }
    }

    /**
     * Store a newly created user (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            // Only admin can create users
            if (!$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
                'role' => ['required', Rule::in(['student', 'teacher', 'admin'])],
            ], [
                'password.regex' => 'Password must contain at least one uppercase, one lowercase, one number, and one special character.',
                'password.min' => 'Password must be at least 8 characters long.',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            Log::info('User created', ['user_id' => $user->id, 'created_by' => $request->user()->id]);

            return response()->json([
                'success' => true,
                'message' => 'User created successfully.',
                'data' => $user->makeHidden(['password']),
            ], 201);
        } catch (\Exception $e) {
            Log::error('User creation error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while creating the user.',
            ], 500);
        }
    }

    /**
     * Display the specified user
     */
    public function show(Request $request, User $user): JsonResponse
    {
        try {
            // Check if user is authorized (own profile or admin)
            if ($request->user()->id !== $user->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to this profile.',
                ], 403);
            }

            return response()->json([
                'success' => true,
                'data' => $user->makeHidden(['password']),
            ], 200);
        } catch (\Exception $e) {
            Log::error('User show error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching user data.',
            ], 500);
        }
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, User $user): JsonResponse
    {
        try {
            // Check if user is authorized (own profile or admin)
            if ($request->user()->id !== $user->id && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized to update this profile.',
                ], 403);
            }

            // Only admin can change roles
            if ($request->has('role') && $request->role !== $user->role && !$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Only administrators can change user roles.',
                ], 403);
            }

            $rules = [
                'name' => 'sometimes|string|max:255',
                'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
                'role' => ['sometimes', Rule::in(['student', 'teacher', 'admin'])],
                'current_password' => 'required_with:password',
                'password' => 'sometimes|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            ];

            $validator = Validator::make($request->all(), $rules);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            // Verify current password if changing password
            if ($request->has('password')) {
                if (!Hash::check($request->current_password, $user->password)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Current password is incorrect.',
                    ], 422);
                }
            }

            $updateData = $request->only(['name', 'email']);
            
            if ($request->has('password')) {
                $updateData['password'] = Hash::make($request->password);
            }
            
            // Only admin can change roles
            if ($request->user()->isAdmin() && $request->has('role')) {
                $updateData['role'] = $request->role;
            }

            $user->update($updateData);

            Log::info('User updated', ['user_id' => $user->id, 'updated_by' => $request->user()->id]);

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully.',
                'data' => $user->fresh()->makeHidden(['password']),
            ], 200);
        } catch (\Exception $e) {
            Log::error('User update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while updating the user.',
            ], 500);
        }
    }

    /**
     * Remove the specified user (Admin only)
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        try {
            // Only admin can delete users
            if (!$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.',
                ], 403);
            }

            // Prevent self-deletion
            if ($request->user()->id === $user->id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot delete your own account.',
                ], 422);
            }

            DB::beginTransaction();
            
            // Delete related tokens
            $user->tokens()->delete();
            
            // Delete user
            $user->delete();
            
            DB::commit();

            Log::warning('User deleted', ['user_id' => $user->id, 'deleted_by' => $request->user()->id]);

            return response()->json([
                'success' => true,
                'message' => 'User deleted successfully.',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('User deletion error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while deleting the user.',
            ], 500);
        }
    }

    /**
     * Get the authenticated user profile
     */
    public function profile(Request $request): JsonResponse
    {
        try {
            return response()->json([
                'success' => true,
                'data' => $request->user()->makeHidden(['password']),
            ], 200);
        } catch (\Exception $e) {
            Log::error('Profile fetch error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while fetching profile.',
            ], 500);
        }
    }

    /**
     * Bulk update users (Admin only)
     */
    public function bulkUpdate(Request $request): JsonResponse
    {
        try {
            if (!$request->user()->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. Admin access required.',
                ], 403);
            }

            $validator = Validator::make($request->all(), [
                'users' => 'required|array',
                'users.*.id' => 'required|exists:users,id',
                'users.*.role' => 'sometimes|in:student,teacher,admin',
                'users.*.name' => 'sometimes|string|max:255',
                'users.*.email' => 'sometimes|email|unique:users,email,{id}',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors(),
                ], 422);
            }

            DB::beginTransaction();
            $updated = [];

            foreach ($request->users as $userData) {
                $user = User::find($userData['id']);
                $updateData = array_intersect_key($userData, array_flip(['name', 'email', 'role']));
                $user->update($updateData);
                $updated[] = $user->fresh()->makeHidden(['password']);
            }

            DB::commit();

            Log::info('Bulk update performed', ['count' => count($updated), 'updated_by' => $request->user()->id]);

            return response()->json([
                'success' => true,
                'message' => 'Users updated successfully.',
                'data' => $updated,
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk update error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred during bulk update.',
            ], 500);
        }
    }
}