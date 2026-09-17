"""Формат ошибок §7: `{"error": "<code>", "message": "<текст в тоне GUIDE>"}`."""

from typing import NoReturn

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

VALIDATION_MESSAGE = "Проверьте запрос: он не подходит по формату."


def error_content(code: str, message: str) -> dict[str, str]:
    """Тело ошибки в едином формате."""
    return {"error": code, "message": message}


def api_error(status_code: int, code: str, message: str) -> NoReturn:
    """Прерывает обработку запроса ошибкой в формате §7."""
    raise HTTPException(status_code=status_code, detail=error_content(code, message))


def register_error_handlers(app: FastAPI) -> None:
    """Приводит все ошибки (включая 422) к формату §7."""

    @app.exception_handler(StarletteHTTPException)
    async def _http_exception(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
        detail = exc.detail
        if isinstance(detail, dict) and "error" in detail and "message" in detail:
            content: dict[str, str] = detail
        else:
            content = error_content("http_error", str(detail))
        return JSONResponse(status_code=exc.status_code, content=content, headers=exc.headers)

    @app.exception_handler(RequestValidationError)
    async def _validation_exception(
        _request: Request, _exc: RequestValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content=error_content("validation_error", VALIDATION_MESSAGE),
        )
