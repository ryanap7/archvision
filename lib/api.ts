import { ApiError, ApiSuccess, ErrorCode } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export function successResponse<T>(
  data: T,
  message = "Success",
  status = 200,
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function errorResponse(
  req: NextRequest,
  code: ErrorCode,
  message: string,
  status = 400,
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        path: req.nextUrl.pathname,
      },
    },
    { status },
  );
}
