using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace ChatAPI.Controllers
{
    public abstract class BaseController : ControllerBase
    {
        protected int GetUserId()
        {
            var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return claim != null ? int.Parse(claim) : 0;
        }
        protected int UserId => GetUserId();
    }
}